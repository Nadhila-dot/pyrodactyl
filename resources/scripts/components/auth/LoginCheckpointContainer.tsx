import type { ActionCreator } from 'easy-peasy';
import { useFormikContext, withFormik } from 'formik';
import { useState } from 'react';
import type { Location, RouteProps } from 'react-router-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Button from '@/components/elements/Button';
import { Card, CardContent } from "@/components/ui/card";
import loginCheckpoint from '@/api/auth/loginCheckpoint';
import type { FlashStore } from '@/state/flashes';
import useFlash from '@/plugins/useFlash';
import Logo from '../elements/PyroLogo';
import CustomOTPInput from './CustomOTP';

interface Values {
    code: string;
    recoveryCode: string;
}

type OwnProps = RouteProps;

type Props = OwnProps & {
    clearAndAddHttpError: ActionCreator<FlashStore['clearAndAddHttpError']['payload']>;
};

function LoginCheckpointForm() {
    const { isSubmitting, setFieldValue, values, handleSubmit } = useFormikContext<Values>();
    const [isMissingDevice, setIsMissingDevice] = useState(false);

    return (
        <Card className="p-8 border-zinc-800 bg-black shadow-xl rounded-xl">
            <CardContent>
                <form className="w-full flex flex-col items-center" onSubmit={handleSubmit}>
                    <Link to='/'>
                        <div className='flex h-12 mb-4 items-center w-full justify-center'>
                            <Logo />
                        </div>
                    </Link>
                    <h2 className='text-2xl font-extrabold mb-2 text-white'>Two Factor Authentication</h2>
                    

                    <div className="w-full flex flex-col items-center">
                        {!isMissingDevice ? (
                            <CustomOTPInput
                                value={values.code}
                                onChange={val => setFieldValue('code', val)}
                                length={6}
                                disabled={isSubmitting}
                            />
                        ) : (
                            <input
                                name="recoveryCode"
                                type="text"
                                value={values.recoveryCode}
                                onChange={e => setFieldValue('recoveryCode', e.target.value)}
                                placeholder="Enter recovery code"
                                className="w-full px-4 py-2 rounded-md border border-emerald-600 bg-black text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                autoFocus
                            />
                        )}
                        <div className="mt-2 text-xs font-black text-white text-center">
                            {isMissingDevice
                                ? 'Enter one of your recovery codes to continue.'
                                : 'Enter the 2FA code from your device.'}
                        </div>
                    </div>
                    <Button
                        className="w-full mt-6 rounded-full bg-emerald-600 hover:bg-emerald-700 border-0 ring-0 outline-hidden capitalize font-bold text-sm py-2 text-white"
                        size="xlarge"
                        type="submit"
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                    >
                        Login
                    </Button>
                   
                    <Button
                        type="button"
                        className="w-full mt-2 text-center py-2.5 px-4 text-xs font-bold tracking-wide uppercase text-white transition-colors duration-200 border border-emerald-600 rounded-full bg-emerald-600 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        onClick={() => {
                            setFieldValue('code', '');
                            setFieldValue('recoveryCode', '');
                            setIsMissingDevice(s => !s);
                        }}
                    >
                        {!isMissingDevice ? "I've Lost My Device" : 'I Have My Device'}
                    </Button>
                    
                    <Button
                        type="button"
                        className="w-full mt-2 text-center bg-emerald-600 hover:bg-emerald-400 py-2.5 px-4 text-xs font-bold tracking-wide uppercase text-white transition-colors duration-200 border border-emerald-600 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        onClick={() => window.location.href = '/auth/login'}
                    >
                        Return to Login
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

const EnhancedForm = withFormik<Props & { location: Location }, Values>({
    handleSubmit: ({ code, recoveryCode }, { setSubmitting, props: { clearAndAddHttpError, location } }) => {
        loginCheckpoint(location.state?.token || '', code, recoveryCode)
            .then((response) => {
                if (response.complete) {
                    window.location = response.intended || '/';
                    return;
                }
                setSubmitting(false);
            })
            .catch((error) => {
                console.error(error);
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    },
    mapPropsToValues: () => ({
        code: '',
        recoveryCode: '',
    }),
})(LoginCheckpointForm);

const LoginCheckpointContainer = ({ ...props }: OwnProps) => {
    const { clearAndAddHttpError } = useFlash();
    const location = useLocation();
    const navigate = useNavigate();

    if (!location.state?.token) {
        navigate('/auth/login');
        return null;
    }

    return <EnhancedForm clearAndAddHttpError={clearAndAddHttpError} location={location} {...props} />;
};

export default LoginCheckpointContainer;