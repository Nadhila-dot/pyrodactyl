import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Turnstile } from '@marsidev/react-turnstile';
import { useStoreState } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { object, string } from 'yup';

import FriendlyCaptcha from '@/components/FriendlyCaptcha';
import login from '@/api/auth/login';
import useFlash from '@/plugins/useFlash';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import FlashMessageRender from '../FlashMessageRender';

interface Values {
    user: string;
    password: string;
}

function LoginContainer() {
    const [token, setToken] = useState('');
    const [friendlyLoaded, setFriendlyLoaded] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const turnstileRef = useRef<any>(null);
    const friendlyCaptchaRef = useRef<{ reset: () => void }>(null);
    const hCaptchaRef = useRef<HCaptcha>(null);

    const { clearFlashes, clearAndAddHttpError, flashes } = useFlash();
    const { captcha } = useStoreState((state) => state.settings.data!);
    const isTurnstileEnabled = captcha.driver === 'turnstile' && captcha.turnstile?.siteKey;
    const isFriendlyEnabled = captcha.driver === 'friendly' && captcha.friendly?.siteKey;
    const isHCaptchaEnabled = captcha.driver === 'hcaptcha' && captcha.hcaptcha?.siteKey;
    const isMCaptchaEnabled = captcha.driver === 'mcaptcha' && captcha.mcaptcha?.siteKey;

    const navigate = useNavigate();

    useEffect(() => {
        clearFlashes();

        // Fetch logo from /nadhi/logo
        fetch('/nadhi/logo')
            .then(res => res.json())
            .then(data => setLogoUrl(data.logo))
            .catch(() => setLogoUrl(null));

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
            // @ts-expect-error
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
        <div className="flex w-full items-center justify-center min-h-screen bg-black relative overflow-hidden">
            {/* Logo background effect
            
            {logoUrl && (
                <img
                    src={logoUrl}
                    alt="Logo"
                    className="absolute bottom-[-40px] right-[-60px] w-[320px] h-[160px] object-cover opacity-25 pointer-events-none select-none"
                    style={{
                        transform: 'rotate(-15deg) scaleX(1.1)',
                        clipPath: 'inset(50% 0 0 0)',
                        zIndex: 0,
                    }}
                />
            )}*/}
            
            {/* Flash message display */}
            {flashes && flashes.length > 0 && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-lg">
                    {flashes.map((flash, i) => (
                        <div key={i} className="bg-red-700 text-white px-4 py-2 rounded mb-2 shadow">
                            {flash.message || flash.error?.message || flash.detail || flash}
                        </div>
                    ))}
                </div>
            )}
            <Formik
                onSubmit={onSubmit}
                initialValues={{ user: '', password: '' }}
                validationSchema={object().shape({
                    user: string().required('A username or email must be provided.'),
                    password: string().required('Please enter your account password.'),
                })}
            >
                {({ isSubmitting, handleChange, values, errors, touched, handleSubmit }) => (
                    <form onSubmit={handleSubmit} className="w-full max-w-lg">
                        <FlashMessageRender/>
                        <Card className="bg-black border border-zinc-800 shadow-lg rounded-xl px-10 py-12 relative overflow-hidden" style={{ zIndex: 1 }}>
                            <CardHeader>
                                <CardTitle className="text-white text-2xl font-bold text-left">
                                    Login to {window.company.name}
                                </CardTitle>
                                <div className="text-zinc-400 mb-4">
                                    Enter your credentials to access your account
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <Label htmlFor="user" className="text-white font-medium">Username or Email</Label>
                                        <Input
                                            id="user"
                                            name="user"
                                            type="text"
                                            value={values.user}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            className="mt-2 bg-zinc-900 border border-zinc-700 text-white focus:border-emerald-500 focus:ring-emerald-500"
                                            autoComplete="username"
                                        />
                                        {touched.user && errors.user && (
                                            <div className="text-red-500 text-xs mt-1">{errors.user}</div>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Label htmlFor="password" className="text-white font-medium">Password</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={values.password}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            className="mt-2 bg-zinc-900 border border-zinc-700 text-white focus:border-emerald-500 focus:ring-emerald-500"
                                            autoComplete="current-password"
                                        />
                                        <Link
                                            to="/auth/password"
                                            className="text-xs text-zinc-400 tracking-wide no-underline hover:text-emerald-500 absolute top-0 right-0 mt-1"
                                        >
                                            Forgot Password?
                                        </Link>
                                        {touched.password && errors.password && (
                                            <div className="text-red-500 text-xs mt-1">{errors.password}</div>
                                        )}
                                    </div>
                                    {isTurnstileEnabled && (
                                        <div className="mt-4">
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
                                        <div className="mt-4">
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
                                        <div className="mt-4">
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
                                        <div className="mt-4">
                                            <p className="text-red-500">mCaptcha implementation needed</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full bg-emerald-600 text-white font-bold py-2 rounded-md hover:bg-emerald-700 transition"
                                    type="submit"
                                    size="lg"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Logging in...' : 'Login'}
                                </Button>
                                <span className='dark:text-white'>
                                    Powered by Contava
                                </span>
                            </CardFooter>
                        </Card>
                    </form>
                )}
            </Formik>
        </div>
    );
}

export default LoginContainer;