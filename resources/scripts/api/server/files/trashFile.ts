import http from '@/api/http';

/**
 * Moves files to a trash directory by renaming them.
 * This is a workaround for the lack of a true trash system in the API :(
 */

interface RenameData {
    from: string;
    to: string;
}

export default (uuid: string, directory: string, files: string[]): Promise<void> => {
    const user = (window as any).PterodactylUser?.username || 'contava';
    const trashDir = `/trash-${user}`;

    const renameFiles: RenameData[] = files.map(filename => ({
        from: filename,
        to: `${filename}`,
    }));

    return new Promise((resolve, reject) => {
        http.put(`/api/client/servers/${uuid}/files/rename`, { root: trashDir, files: renameFiles })
            .then(() => resolve())
            .catch(reject);
    });
};