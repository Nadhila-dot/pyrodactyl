import { Formik, Form, Field } from 'formik';
import { useState, useEffect } from 'react';
import { object, string } from 'yup';

import ContentBox from '@/components/elements/ContentBox';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import Input from '@/components/elements/Input';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Button } from '@/components/elements/button/index';
import { toast } from 'sonner';

interface Values {
    fontFamily: string;
}

const applyFont = (fontFamily: string) => {
    if (!fontFamily) return;
    // Remove previous font link if exists
    const prev = document.getElementById('custom-google-font');
    if (prev) prev.remove();
    // Add new font link (Google Fonts v2 API)
    const link = document.createElement('link');
    link.id = 'custom-google-font';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily.replace(/ /g, '+'))}&display=swap`;
    document.head.appendChild(link);
    // Apply font globally via CSS variable
    document.documentElement.style.setProperty('--main-font', `'${fontFamily.replace(/\+/g, ' ')}', sans-serif`);
};

const FontSettings = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const savedFont = localStorage.getItem('FONT_MAIN_PAGE');
        if (savedFont) applyFont(savedFont);
    }, []);

    const submit = (values: Values, { setSubmitting, resetForm }: any) => {
        setIsSubmitting(true);
        localStorage.setItem('FONT_MAIN_PAGE', values.fontFamily);
        applyFont(values.fontFamily);
        toast.success('Font updated, reloading page...');
        window.location.reload();
        
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitting(false);
            resetForm();
        }, 500);
    };

    return (
        <ContentBox>
            <Formik
                onSubmit={submit}
                initialValues={{ fontFamily: localStorage.getItem('FONT_MAIN_PAGE') || '' }}
                validationSchema={object().shape({
                    fontFamily: string().required('Font family is required'),
                })}
            >
                {({ isSubmitting }) => (
                    <Form className='space-y-6'>
                        <SpinnerOverlay visible={isSubmitting || isSubmitting} />

                        <FormikFieldWrapper
                            label='Google Font Family'
                            name='fontFamily'
                            description={
                                <>
                                    Enter any Google Fonts family name (e.g. <b>Roboto</b>, <b>Doto</b>, <b>Poppins</b>).<br />
                                    <a href="https://fonts.google.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">Browse Google Fonts</a>
                                </>
                            }
                        >
                            <Field name='fontFamily' as={Input} className='w-full' />
                        </FormikFieldWrapper>

                        <div className='flex justify-end mt-6'>
                            <Button type='submit' disabled={isSubmitting || isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Font'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </ContentBox>
    );
};

FontSettings.displayName = 'FontSettings';
export default FontSettings;