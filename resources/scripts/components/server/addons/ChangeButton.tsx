import Button from '@/components/elements/button/Button';
import { useContext } from 'react';
import { ServerContext } from '@/state/server';

const ChangeButton: React.FC = () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    

    const handleClick = () => {
        try {
            localStorage.removeItem(`creeper_selected_game_${uuid}`);
        } catch {
            // ignore errors
        }
        window.location.reload();
    };

    return (
        <Button className="" size="large" onClick={handleClick}>
            Choose Another Game
        </Button>
    );
};

export default ChangeButton;