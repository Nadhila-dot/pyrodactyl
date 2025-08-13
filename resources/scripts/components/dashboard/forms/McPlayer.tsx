import { Formik, Form, Field } from 'formik';
import { useState } from 'react';
import { object } from 'yup';

import ContentBox from '@/components/elements/ContentBox';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Button } from '@/components/elements/button/index';
import { toast } from 'sonner';

interface Values {
    showPlayers: boolean;
}

const McPlayer = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = (values: Values, { setSubmitting }: any) => {
        setIsSubmitting(true);
        localStorage.setItem('player_mc', values.showPlayers ? 'true' : 'false');
        toast.success('Player visibility updated!');
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitting(false);
        }, 500); // Simulate async
    };

    return (
        <ContentBox>
            <Formik
                onSubmit={submit}
                initialValues={{
                    showPlayers: localStorage.getItem('player_mc') !== 'false', // Default to true if not set
                }}
                validationSchema={object().shape({})} // No validation needed for a boolean
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-6">
                        <SpinnerOverlay visible={isSubmitting} />

                        <FormikFieldWrapper
                            label="Show Players"
                            name="showPlayers"
                            description="Enable or disable the display of players on the server."
                        >
                            <Field
                                name="showPlayers"
                                type="checkbox"
                                className="w-5 h-5"
                            />
                        </FormikFieldWrapper>

                        <div className="flex justify-end mt-6">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </ContentBox>
    );
};

McPlayer.displayName = 'McPlayer';
export default McPlayer;