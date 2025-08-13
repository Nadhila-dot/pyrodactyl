import React from 'react';
import Dialog from '@/components/elements/dialog/Dialog';
import Button from '@/components/elements/button/Button';

interface ConsoleErrorModalProps {
    error: string | null;
    onClose: () => void;
}

const ConsoleErrorModal: React.FC<ConsoleErrorModalProps> = ({ error, onClose }) => {
    if (!error) return null;

    return (
        <Dialog
            open={!!error}
            title="Attention!"
            // description="An error occurred while processing your request."
            onClose={onClose}
        >
            <p className="mt-2 text-2xl text-gray-300">{error}</p>
            <div className="mt-4 flex justify-end">
            <Button onClick={onClose}>
                Close
            </Button>
            </div>
        </Dialog>
    );
};

export default ConsoleErrorModal;