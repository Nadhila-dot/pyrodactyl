import ScreenBlock from '@/components/elements/ScreenBlock';

import { ServerContext } from '@/state/server';

import Spinner from '../elements/Spinner';
import ServerInstallingContainer from './ServerInstallingContainer';

const ConflictStateRenderer = () => {
    const status = ServerContext.useStoreState((state) => state.server.data?.status || null);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data?.isTransferring || false);
    const isNodeUnderMaintenance = ServerContext.useStoreState(
        (state) => state.server.data?.isNodeUnderMaintenance || false,
    );

    return status === 'installing' || status === 'install_failed' || status === 'reinstall_failed' ? (
       

        <ServerInstallingContainer/>
    ) : status === 'suspended' ? (
        <ScreenBlock title={'Server Suspended'} message={'This server is suspended and cannot be accessed.'} />
    ) : isNodeUnderMaintenance ? (
        <ScreenBlock
            title={'Node under Maintenance'}
            message={'The node of this server is currently under maintenance.'}
        />
    ) : (
        <ScreenBlock
            title={isTransferring ? 'Transferring' : 'Restoring from Backup'}
            message={
                isTransferring
                    ? 'Your server is being transferred to a new node, please check back later.'
                    : 'Your server is currently being restored from a backup, please check back in a few minutes.'
            }
        />
    );
};

export default ConflictStateRenderer;
