import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Turnstile } from '@marsidev/react-turnstile';
import { useStoreState } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { object, string } from 'yup';
import { IconLock, IconUser } from '@tabler/icons-react';

import FriendlyCaptcha from '@/components/FriendlyCaptcha';
import login from '@/api/auth/login';
import useFlash from '@/plugins/useFlash';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import FlashMessageRender from '../FlashMessageRender';
import DarkVeil from '../misc/veil';
import Galaxy from '../Galaxy/Galaxy';
import LightRays from '../LightRays/LightRays';
import PyroLogo from '../elements/PyroLogo';
import { Separator } from '../ui/separator';


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

    function usePingPong360(speed: number = 1) {
        const [value, setValue] = useState(1);
        const direction = useRef(1);

        useEffect(() => {
            const interval = setInterval(() => {
                setValue(prev => {
                    let next = prev + direction.current * speed;
                    if (next >= 360) {
                        next = 360;
                        direction.current = -1;
                    } else if (next <= 1) {
                        next = 1;
                        direction.current = 1;
                    }
                    return next;
                });
            }, 16); // ~60fps
            return () => clearInterval(interval);
        }, [speed]);

        return value;
    }

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
        <div
            className="flex items-center justify-center min-h-screen w-full bg-black bg-cover bg-center"
            style={{
                backgroundImage: `url('https://images.wallpapersden.com/image/download/black-4k-windows-11-original_bmVsbWaUmZqaraWkpJRobWllrWdpZWU.jpg')`,
            }}
        >
            <div className="absolute inset-0 bg-black/70 pointer-events-none" />
            <div className="relative z-10 w-full max-w-2xl px-4"> {/* Increased max-w-lg to max-w-2xl */}
                <div className="absolute inset-0 pointer-events-none">
                    <DarkVeil speed={2} scanlineFrequency={3} hueShift={120} />
                </div>
                <div className="relative">
                    {/* Flash message display */}
                    {flashes && flashes.length > 0 && (
                        <div className="w-full max-w-2xl mb-4">
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
                            <form onSubmit={handleSubmit} className="w-full max-w-xl"> {/* Increased max-w-lg to max-w-2xl */}
                                <FlashMessageRender />
                                <Card className="bg-black/80 border border-zinc-800 shadow-lg rounded-xl px-4 py-12 relative overflow-hidden" style={{ zIndex: 1 }}>
                                    <CardHeader>
                                        <CardTitle className="flex flex-col items-start gap-2">
                                            <div className="flex items-center gap-4 w-full">
                                                {logoUrl && (
                                                    <img
                                                        src={logoUrl}
                                                        alt="Logo"
                                                        className="h-16 mb-2"
                                                        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }}
                                                    />
                                                )}
                                                <span className="text-5xl text-white font-bold">
                                                    {window.company?.name || 'Panel'}
                                                </span>
                                            </div>
                                            <Separator className="bg-zinc-500/40  opacity-70" />
                                           
                                        </CardTitle>
                                        
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="user" className={`text-base sm:text-lg text-gray-200`}>
                                                    Username or Email
                                                </Label>
                                                <div className="relative">
                                                    <IconUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                                    <Input
                                                        id="user"
                                                        name="user"
                                                        type="text"
                                                        placeholder="example@example.com"
                                                        value={values.user}
                                                        onChange={handleChange}
                                                        className="pl-10 h-12 w-full bg-zinc-900 border-gray-700 text-white"
                                                        disabled={isSubmitting}
                                                        autoComplete="username"
                                                    />
                                                </div>
                                                {touched.user && errors.user && (
                                                    <p className="text-sm text-red-500">{errors.user}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="password" className="text-base sm:text-lg text-gray-200">
                                                        Password
                                                    </Label>
                                                    <Link
                                                        to="/auth/password"
                                                        className="text-xs text-zinc-400 tracking-wide no-underline hover:text-emerald-500"
                                                    >
                                                        Forgot Password?
                                                    </Link>
                                                </div>
                                                <div className="relative">
                                                    <IconLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                                    <Input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={values.password}
                                                        onChange={handleChange}
                                                        className="pl-10 h-12 w-full bg-zinc-900 border-gray-700 text-white"
                                                        disabled={isSubmitting}
                                                        autoComplete="current-password"
                                                    />
                                                </div>
                                                {touched.password && errors.password && (
                                                    <p className="text-sm text-red-500">{errors.password}</p>
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
                                    <CardFooter className="flex flex-col gap-2 items-center">
                                        <Button
                                            className="w-full bg-emerald-600 text-white font-bold py-2 rounded-md hover:bg-emerald-700 transition"
                                            type="submit"
                                            size="lg"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Logging in...' : 'Login'}
                                        </Button>

                                        <span className="text-xs text-zinc-400 mt-1">
                                            Pterodactyl &copy; 2014-2025 &middot; {window.SiteConfiguration.name} &copy; 2025
                                        </span>
                                    </CardFooter>
                                </Card>
                            </form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
}

export default LoginContainer;