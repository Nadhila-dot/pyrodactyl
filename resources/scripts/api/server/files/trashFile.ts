import http from '@/api/http';

/**
 * Moves files to a trash directory by renaming them.
 * The root is always /trash-${user}
 */

interface RenameData {
    from: string;
    to: string;
}

export default (uuid: string, files: string[]): Promise<void> => {
    const user = (window as any).PterodactylUser?.username || 'contava';
    const trashRoot = `/trash-${user}`;

    const renameFiles: RenameData[] = files.map(filename => ({
        from: filename,
        to: filename, // keep the same filename in trash
    }));

    return new Promise((resolve, reject) => {
        http.put(`/api/client/servers/${uuid}/files/rename`, { root: trashRoot, files: renameFiles })
            .then(() => resolve())
            .catch(reject);
    });
};