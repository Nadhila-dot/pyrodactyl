import { Formik, Form, Field } from 'formik';
import { useState } from 'react';
import { object, string } from 'yup';

import ContentBox from '@/components/elements/ContentBox';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import Input from '@/components/elements/Input';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Button } from '@/components/elements/button/index';
import { toast } from 'sonner';

import FontSettings from './FontSettings';

interface Values {
    bgImage: string;
}

const ThemeSettings = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = (values: Values, { setSubmitting, resetForm }: any) => {
        setIsSubmitting(true);
        localStorage.setItem('IMG_MAIN_PAGE', values.bgImage);
        toast.success('Reloading your changes..');
        window.location.reload();
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitting(false);
            resetForm();
        }, 500); // Simulate async
    };

    return (
        <ContentBox>
            <Formik
                onSubmit={submit}
                initialValues={{ bgImage: localStorage.getItem('IMG_MAIN_PAGE') || '' }}
                validationSchema={object().shape({
                    bgImage: string().url('Must be a valid image URL').required('Image URL is required'),
                })}
            >
                {({ isSubmitting }) => (
                    <Form className='space-y-6'>
                        <SpinnerOverlay visible={isSubmitting || isSubmitting} />

                        <FormikFieldWrapper
                            label='Background Image URL'
                            name='bgImage'
                            description='Paste the URL of the image you want as your main page background.'
                        >
                            <Field name='bgImage' as={Input} className='w-full' />
                        </FormikFieldWrapper>

                        <div className='flex justify-end mt-6'>
                            <Button type='submit' disabled={isSubmitting || isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Background'}
                            </Button>
                        </div>

                        {/* Font settings imported from FontSettings component */}
                        
                    </Form>

                    
                )}
            </Formik>

        
        </ContentBox>
    );
};

ThemeSettings.displayName = 'ThemeSettings';
export default ThemeSettings;