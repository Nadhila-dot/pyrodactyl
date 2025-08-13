import { useState } from 'react';
import ContentBox from '@/components/elements/ContentBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Button } from '@/components/elements/button/index';
import { toast } from 'sonner';

const McPlayer = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPlayers, setShowPlayers] = useState(() => localStorage.getItem('player_mc') !== 'false'); // Default to true if not set

    const togglePlayerVisibility = () => {
        setIsSubmitting(true);
        const newValue = !showPlayers;
        setShowPlayers(newValue);
        localStorage.setItem('player_mc', newValue ? 'true' : 'false');
        toast.success(`Player visibility ${newValue ? 'enabled' : 'disabled'}!`);
        setTimeout(() => {
            setIsSubmitting(false);
        }, 50); // add stuff later
        window.location.reload(); // Reload the page to apply changes
    };

    return (
        <ContentBox>
            <SpinnerOverlay visible={isSubmitting} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Show Minecraft Players</h3>
                        <p className="text-sm text-gray-500">
                            Enable or disable the display of players on the server.
                        </p>
                    </div>
                    <Button
                        onClick={togglePlayerVisibility}
                        disabled={isSubmitting}
                        className={`px-4 py-2 rounded-full ${
                            showPlayers ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-700'
                        }`}
                    >
                        {showPlayers ? 'Enabled' : 'Disabled'}
                    </Button>
                </div>
            </div>
        </ContentBox>
    );
};

McPlayer.displayName = 'McPlayer';
export default McPlayer;