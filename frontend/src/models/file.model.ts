export interface LocalFile {
    type: 'local',
    file: File
}

export interface RemoteFile {
    type: 'remote',
    path: string,
    fileId: string
}

export type LocalImage = LocalFile;
export type RemoteImage = RemoteFile;
export type ImageResource = LocalImage | RemoteImage;
export type FileResource = LocalFile | RemoteFile;