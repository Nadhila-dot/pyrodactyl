import React from 'react';
import Dialog from '@/components/elements/dialog/Dialog';

interface ConsoleErrorModalProps {
    error: string | null;
    onClose: () => void;
}

const ConsoleErrorModal: React.FC<ConsoleErrorModalProps> = ({ error, onClose }) => {
    if (!error) return null;

    return (
        <Dialog
            open={!!error}
            title="Error"
            description="An error occurred while processing your request."
            onClose={onClose}
        >
            <p className="mt-2 text-gray-300">{error}</p>
            <div className="mt-4 flex justify-end">
                <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </Dialog>
    );
};

export default ConsoleErrorModal;