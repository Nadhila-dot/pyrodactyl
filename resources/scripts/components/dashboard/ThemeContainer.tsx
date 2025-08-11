import { useLocation } from 'react-router-dom';

import MessageBox from '@/components/MessageBox';
import ConfigureTwoFactorForm from '@/components/dashboard/forms/ConfigureTwoFactorForm';
import UpdateEmailAddressForm from '@/components/dashboard/forms/UpdateEmailAddressForm';
import UpdatePasswordForm from '@/components/dashboard/forms/UpdatePasswordForm';
import ContentBox from '@/components/elements/ContentBox';
import PageContentBlock from '@/components/elements/PageContentBlock';
import ThemeSettings from '@/components/dashboard/forms/ThemeSettings';

import Code from '../elements/Code';
import FontSettings from './forms/FontSettings';

const ThemeContainer = () => {
    const { state } = useLocation();

    return (
        <PageContentBlock title={'Theme Settings'}>
            <h1 className='text-[52px] font-extrabold leading-[98%] tracking-[-0.14rem] mb-8'>Theme Settings</h1>
            

            <div className='flex flex-col w-full h-full gap-4'>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex flex-col gap-4">
                        
                        <ThemeSettings />
                        <FontSettings/>
                        
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                        {/* Opposite side  */}
                         
                    </div>
                    
                </div>
            </div>
        </PageContentBlock>
    );
};

export default ThemeContainer;