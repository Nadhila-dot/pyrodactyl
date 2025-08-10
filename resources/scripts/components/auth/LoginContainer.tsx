import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Turnstile } from '@marsidev/react-turnstile';
import { useStoreState } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { object, string } from 'yup';

import FriendlyCaptcha from '@/components/FriendlyCaptcha';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import Button from '@/components/elements/Button';
import Field from '@/components/elements/Field';

import login from '@/api/auth/login';

import useFlash from '@/plugins/useFlash';

interface Values {
    user: string;
    password: string;
}

function LoginContainer() {
    const [token, setToken] = useState('');
    const [friendlyLoaded, setFriendlyLoaded] = useState(false);
    const turnstileRef = useRef(null);
    const friendlyCaptchaRef = useRef<{ reset: () => void }>(null);
    const hCaptchaRef = useRef<HCaptcha>(null);
    const mCaptchaRef = useRef<{ reset: () => void }>(null);

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { captcha } = useStoreState((state) => state.settings.data!);
    const isTurnstileEnabled = captcha.driver === 'turnstile' && captcha.turnstile?.siteKey;
    const isFriendlyEnabled = captcha.driver === 'friendly' && captcha.friendly?.siteKey;
    const isHCaptchaEnabled = captcha.driver === 'hcaptcha' && captcha.hcaptcha?.siteKey;
    const isMCaptchaEnabled = captcha.driver === 'mcaptcha' && captcha.mcaptcha?.siteKey;

    const navigate = useNavigate();

    useEffect(() => {
        clearFlashes();

        if (isFriendlyEnabled && !window.friendlyChallenge) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/friendly-challenge@0.9.12/widget.module.min.js';
            script.async = true;
            script.defer = true;
            script.onload = () => setFriendlyLoaded(true);
            document.body.appendChild(script);
        } else if (isFriendlyEnabled) {
            setFriendlyLoaded(true);
        }
    }, []);

    const resetCaptcha = () => {
        setToken('');
        if (isTurnstileEnabled && turnstileRef.current) {
            // @ts-expect-error - The type doesn't expose the reset method directly
            turnstileRef.current.reset();
        }
        if (isFriendlyEnabled && friendlyCaptchaRef.current) {
            friendlyCaptchaRef.current.reset();
        }
        if (isHCaptchaEnabled && hCaptchaRef.current) {
            hCaptchaRef.current.resetCaptcha();
        }
    };

    const handleCaptchaComplete = (response: string) => {
        setToken(response);
    };

    const handleCaptchaError = (provider: string) => {
        setToken('');
        clearAndAddHttpError({ error: new Error(`${provider} challenge failed.`) });
    };

    const handleCaptchaExpire = () => {
        setToken('');
    };

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        if ((isTurnstileEnabled || isFriendlyEnabled || isHCaptchaEnabled) && !token) {
            setSubmitting(false);
            clearAndAddHttpError({ error: new Error('Please complete the CAPTCHA challenge.') });
            return;
        }

        const requestData: Record<string, string> = {
            user: values.user,
            password: values.password,
        };

        if (isTurnstileEnabled) {
            requestData['cf-turnstile-response'] = token;
            if (process.env.NODE_ENV === 'development') {
                requestData['cf-turnstile-remoteip'] = 'localhost';
            }
        } else if (isHCaptchaEnabled) {
            requestData['h-captcha-response'] = token;
        } else if (isFriendlyEnabled) {
            requestData['frc-captcha-response'] = token;
        }

        login(requestData)
            .then((response) => {
                if (response.complete) {
                    window.location.href = response.intended || '/';
                    return;
                }
                navigate('/auth/login/checkpoint', { state: { token: response.confirmationToken } });
            })
            .catch((error: any) => {
                resetCaptcha();
                setSubmitting(false);

                if (error.code === 'InvalidCredentials') {
                    clearAndAddHttpError({ error: new Error('Invalid username or password. Please try again.') });
                } else if (error.code === 'DisplayException') {
                    clearAndAddHttpError({ error: new Error(error.detail || error.message) });
                } else {
                    clearAndAddHttpError({ error });
                }
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ user: '', password: '' }}
            validationSchema={object().shape({
                user: string().required('A username or email must be provided.'),
                password: string().required('Please enter your account password.'),
            })}
        >
            {({ isSubmitting }) => (
                <LoginFormContainer className="w-full flex flex-col items-center justify-center bg-[#181818] border border-zinc-800 shadow-lg px-8 py-10" style={{ maxWidth: 400, margin: '0 auto', borderRadius: 0 }}>
                    <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Sign in to your account</h2>
                    <Field id="user" type="text" label="Username or Email" name="user" disabled={isSubmitting} inputClassName="bg-[#222] border-zinc-700 text-white" labelClassName="text-zinc-400" />
                    <div className="relative mt-6 w-full">
                        <Field
                            id="password"
                            type="password"
                            label="Password"
                            name="password"
                            disabled={isSubmitting}
                            inputClassName="bg-[#222] border-zinc-700 text-white"
                            labelClassName="text-zinc-400"
                        />
                        <Link
                            to="/auth/password"
                            className="text-xs text-zinc-500 tracking-wide no-underline hover:text-zinc-400 absolute top-1 right-0"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {isTurnstileEnabled && (
                        <div className="mt-6 w-full">
                            <Turnstile
                                ref={turnstileRef}
                                siteKey={captcha.turnstile.siteKey}
                                onSuccess={handleCaptchaComplete}
                                onError={() => handleCaptchaError('Turnstile')}
                                onExpire={handleCaptchaExpire}
                                options={{
                                    theme: 'dark',
                                    size: 'flexible',
                                }}
                            />
                        </div>
                    )}

                    {isFriendlyEnabled && friendlyLoaded && (
                        <div className="mt-6 w-full">
                            <FriendlyCaptcha
                                ref={friendlyCaptchaRef}
                                sitekey={captcha.friendly.siteKey}
                                onComplete={handleCaptchaComplete}
                                onError={() => handleCaptchaError('FriendlyCaptcha')}
                                onExpire={handleCaptchaExpire}
                            />
                        </div>
                    )}

                    {isHCaptchaEnabled && (
                        <div className="mt-6 w-full">
                            <HCaptcha
                                ref={hCaptchaRef}
                                sitekey={captcha.hcaptcha.siteKey}
                                onVerify={handleCaptchaComplete}
                                onError={() => handleCaptchaError('hCaptcha')}
                                onExpire={handleCaptchaExpire}
                                theme="dark"
                                size="normal"
                            />
                        </div>
                    )}

                    {isMCaptchaEnabled && (
                        <div className="mt-6 w-full">
                            <p className="text-red-500">mCaptcha implementation needed</p>
                        </div>
                    )}

                    <div className="mt-8 w-full">
                        <Button
                            className="w-full bg-[#222] text-white font-bold py-2 border-none shadow-none rounded-none hover:bg-[#333] transition"
                            type="submit"
                            size="xlarge"
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Login
                        </Button>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
}

export default LoginContainer;