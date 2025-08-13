import { encodePathSegments } from '@/helpers';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { join } from 'pathe';
import { ReactNode, memo } from 'react';
import isEqual from 'react-fast-compare';
import { NavLink } from 'react-router-dom';

import { ContextMenu, ContextMenuTrigger } from '@/components/elements/ContextMenu';
import SelectFileCheckbox from '@/components/server/files/SelectFileCheckbox';

import { bytesToString } from '@/lib/formatters';

import { FileObject } from '@/api/server/files/loadDirectory';

import { ServerContext } from '@/state/server';

import { usePermissions } from '@/plugins/usePermissions';

import FileDropdownMenu from './FileDropdownMenu';
import styles from './style.module.css';

import { IconFile, IconFolder, IconWorld, IconFileZip, IconFileCode, IconFileText, IconPuzzle, IconCube, IconUser, IconSettings } from '@tabler/icons-react';

// Todo Add more icons and ability to change brand color
// in this instance emerald-800 is used as brand color

function getFileIcon(file: FileObject): ReactNode {
    if (!file.isFile) {
        // Handle directories
        if (file.name.toLowerCase().includes('world')) {
            return <IconWorld size={20} className="text-emerald-800" />;
        }

        if (file.name.toLowerCase().includes('plugins')) {
            return <IconPuzzle size={20} className="text-emerald-800" />;
        }

        if (file.name.toLowerCase().includes('mods')) {
            return <IconCube size={20} className="text-zinc-100" />;
        }

        if (file.name.toLowerCase().includes('config')) {
            return <IconSettings size={20} className="text-emerald-800" />;
        }

        return <IconFolder size={20} className="text-zinc-100" />;
    }

    // Handle files
    if (file.name.endsWith('.zip') || file.name.endsWith('.tar') || file.name.endsWith('.gz')) {
        return <IconFileZip size={20} className="text-zinc-100" />;
    }

    if (file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.json') || file.name.endsWith('.yaml') || file.name.endsWith('.yml') || file.name.endsWith('.py')) {
        return <IconFileCode size={20} className="text-zinc-100" />;
    }

    if (file.name.endsWith('.txt') || file.name.endsWith('.log')) {
        return <IconFileText size={20} className="text-zinc-100" />;
    }

    if (file.name.includes('player')) {
        return <IconUser size={20} className="text-zinc-100" />;
    }

    // Default file icon
    // You can replace this with any other icon you prefer
    return <IconFile size={20} className="text-zinc-100" />;
}

function Clickable({ file, children }: { file: FileObject; children: ReactNode }) {
    const [canRead] = usePermissions(['file.read']);
    const [canReadContents] = usePermissions(['file.read-content']);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    return (file.isFile && (!file.isEditable() || !canReadContents)) || (!file.isFile && !canRead) ? (
        <div className={styles.details}>{children}</div>
    ) : (
        <NavLink
            className={styles.details}
            to={`/server/${id}/files${file.isFile ? '/edit' : '#'}${encodePathSegments(join(directory, file.name))}`}
        >
            {children}
        </NavLink>
    );
}

const MemoizedClickable = memo(Clickable, isEqual);

const FileObjectRow = ({ file }: { file: FileObject }) => (
    <ContextMenu>
        <ContextMenuTrigger asChild>
            <div className={styles.file_row} key={file.name}>
                <SelectFileCheckbox name={file.name} />
                <MemoizedClickable file={file}>
                    <div className={`flex-none text-zinc-400 mr-4 text-lg pl-3 mb-0.5`}>
                        {getFileIcon(file)}
                    </div>
                    <div className={`flex-1 truncate font-bold text-sm`}>{file.name}</div>
                    {file.isFile && (
                        <div className={`w-1/6 text-right mr-4 hidden sm:block text-xs`}>
                            {bytesToString(file.size)}
                        </div>
                    )}
                    <div className={`w-1/5 text-right mr-4 hidden md:block text-xs`} title={file.modifiedAt.toString()}>
                        {Math.abs(differenceInHours(file.modifiedAt, new Date())) > 48
                            ? format(file.modifiedAt, 'MMM do, yyyy h:mma')
                            : formatDistanceToNow(file.modifiedAt, { addSuffix: true })}
                    </div>
                </MemoizedClickable>
            </div>
        </ContextMenuTrigger>
        <FileDropdownMenu file={file} />
    </ContextMenu>
);

export default memo(FileObjectRow, (prevProps, nextProps) => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { isArchiveType, isEditable, ...prevFile } = prevProps.file;
    const { isArchiveType: nextIsArchiveType, isEditable: nextIsEditable, ...nextFile } = nextProps.file;
    /* eslint-enable @typescript-eslint/no-unused-vars */

    return isEqual(prevFile, nextFile);
});
