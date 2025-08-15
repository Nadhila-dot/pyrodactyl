import { useState } from 'react';
import ContentBox from '@/components/elements/ContentBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Button } from '@/components/elements/button/index';
import { toast } from 'sonner';


const AccentColors = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accent, setAccent] = useState(() => localStorage.getItem('accent') || '');

    const handleAccentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAccent(e.target.value);
    };

    const submitAccent = () => {
        setIsSubmitting(true);
        localStorage.setItem('accent', accent);
        toast.success(`Accent color set to "${accent}"!`);
        setTimeout(() => {
            setIsSubmitting(false);
        }, 50);
        document.documentElement.style.setProperty('--main-color', accent);
    };

    return (
        <ContentBox>
            <SpinnerOverlay visible={isSubmitting} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Set Accent Color</h3>
                        <p className="text-sm text-gray-500">
                            Enter a new accent color value (e.g., #10b981 or emerald-500).
                        </p>
                    </div>
                    <input
                        type="text"
                        value={accent}
                        onChange={handleAccentChange}
                        className="border rounded px-2 py-1 mr-2"
                        placeholder="Accent color"
                        disabled={isSubmitting}
                    />
                    <Button
                        onClick={submitAccent}
                        disabled={isSubmitting || !accent}
                        className="px-4 py-2 rounded-full bg-emerald-500 text-white"
                    >
                        Set
                    </Button>
                </div>
            </div>
        </ContentBox>
    );
};

export default AccentColors;