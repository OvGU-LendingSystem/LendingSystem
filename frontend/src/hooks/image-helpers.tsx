import { gql, useMutation } from "@apollo/client";
import { useCallback } from "react";
import { FileResource, ImageResource, LocalImage, RemoteFile, RemoteImage } from "../models/file.model";

// GQL mutations ------------------------------------------------------------------

const ADD_FILE = gql`
    mutation UploadFile($file: Upload!) {
        uploadFile(file: $file) {
            ok,
            infoText,
            file {
                fileId
            }
        }
    }
`;

interface AddFileResult {
    ok: boolean,
    infoText: string,
    file: RemoteImage
}

const REMOVE_FILE = gql`
    mutation RemoveFile($fileId: String!) {
        deleteFile(fileId: $fileId) {
            ok,
            infoText
        }
    }
`;

// Helper functions ------------------------------------------------------------------

export function isLocalFile(image: ImageResource): image is LocalImage {
    return image.type === 'local';
}

export function isRemoteFile(image: ImageResource): image is RemoteImage {
    return image.type === 'remote';
}

export function getRemovedFiles(oldFiles: FileResource[], newFiles: FileResource[]) {
    const newRemoteFiles = newFiles.filter(isRemoteFile);
    const notInNewFiles = (oldFile: RemoteFile) => -1 === newRemoteFiles.findIndex((file) => file.fileId === oldFile.fileId);

    return oldFiles.filter(isRemoteFile).filter(notInNewFiles);
}

export async function uploadFiles(images: FileResource[], addImage: (file: File) => Promise<RemoteFile>) {
    const uploadedImages = images.map(async (file) => {
        return isLocalFile(file) ? await addImage(file.file) : file;
    });

    return Promise.allSettled(uploadedImages);
}

export async function deleteFiles(files: RemoteImage[], removeFile: (id: string) => Promise<void>) {
    for (let file of files) {
        await removeFile(file.fileId);
    };
}

function isFailedPromise<T>(res: PromiseSettledResult<T>): res is PromiseRejectedResult {
    return res.status === 'rejected';
}

export interface UploadSuccessResult {
    success: true,
    value: RemoteImage[]
}

export interface UploadFailedResult {
    success: false,
    error: any
}

export function uploadSuccessful(res: Awaited<ReturnType<typeof uploadFiles>>): UploadSuccessResult | UploadFailedResult {
    const value = [];

    for (const elem of res) {
        if (isFailedPromise(elem)) {
            return { success: false, error: elem.reason };
        }

        value.push(elem.value);
    }

    return { success: true, value: value }
}

// Helper hooks ----------------------------------------------------------------------------------------

export function useUploadMissingFiles() {
    const [ addFileMutation ] = useMutation<{ uploadFile: AddFileResult }>(ADD_FILE);
    const addFile = useCallback(async (file: File) => {
        const res = await addFileMutation({ variables: { file: file } });
        const val: RemoteFile = {
            type: 'remote',
            path: res.data!.uploadFile.file.path,
            fileId: res.data!.uploadFile.file.fileId // TODO handle error
        };
        return val;
    }, []);

    const upload = useCallback(async (files: FileResource[]) => {
        return uploadFiles(files, addFile);
    }, []);

    return upload;
}

export function useDeleteFiles() {
    const [ removeFileMutation ] = useMutation(REMOVE_FILE);
    const removeFile = useCallback(async (fileId: string) => {
        await removeFileMutation({ variables: { fileId: fileId } });
    }, []);

    const remove = useCallback(async (files: RemoteFile[]) => {
        await deleteFiles(files, removeFile);
    }, []);

    return remove;
}

export type UpdateFailedResult = UploadFailedResult;
export interface UpdateSuccessResult {
    success: true,
    value: string[]
};
export type UpdateResult = UpdateFailedResult | UpdateSuccessResult;

export function useUpdateFiles() {
    const uploadFiles = useUploadMissingFiles();
    const deleteFiles = useDeleteFiles();

    const update = async (oldFiles: FileResource[], newFiles: FileResource[]): Promise<[UpdateResult, () => Promise<UpdateResult>]> => {
        let uploadedFiles = newFiles;

        const upload = async () => {
            const uploadResult = await uploadFiles(uploadedFiles);
            const uploadResultStatus = uploadSuccessful(uploadResult);
            
            if (uploadResultStatus.success) {
                uploadedFiles = uploadResultStatus.value;
                const status: UpdateSuccessResult = {
                    success: true,
                    value: uploadResultStatus.value.map((file) => file.fileId)
                }
                return status;
            } else {
                uploadedFiles = uploadResult.map((res, idx) => {
                    if (res.status === 'fulfilled')
                        return res.value;
                    return newFiles[idx];
                });
                return uploadResultStatus;
            }
        }

        const uploadResult = await upload();
        const removedFiles = getRemovedFiles(oldFiles, newFiles);
        try {
            await deleteFiles(removedFiles);
        } catch(e) {} // ignore failed delete

        return [ uploadResult, upload ]; /* uploadResult, retry */
    }

    return update;
}