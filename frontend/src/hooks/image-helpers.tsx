import { gql, useMutation } from "@apollo/client";
import { useCallback } from "react";
import { ImageResource, LocalImage, RemoteImage } from "../models/InventoryItem.model";

// GQL mutations ------------------------------------------------------------------

const ADD_IMAGE = gql`
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

interface AddImageResult {
    ok: boolean,
    infoText: string,
    file: RemoteImage
}

const REMOVE_IMAGE = gql`
    mutation RemoveFile($fileId: String!) {
        deleteFile(fileId: $fileId) {
            ok,
            infoText
        }
    }
`;

// Helper functions ------------------------------------------------------------------

export function isLocalImage(image: ImageResource): image is LocalImage {
    return image.type === 'local';
}

export function isRemoteImage(image: ImageResource): image is RemoteImage {
    return image.type === 'remote';
}

export function getRemovedImages(oldImages: ImageResource[], newImages: ImageResource[]) {
    const newRemoteImages = newImages.filter(isRemoteImage);
    const notInNewImages = (oldImage: RemoteImage) => -1 === newRemoteImages.findIndex((img) => img.fileId === oldImage.fileId);

    return oldImages.filter(isRemoteImage).filter(notInNewImages);
}

export async function uploadImages(images: ImageResource[], addImage: (file: File) => Promise<RemoteImage>) {
    const uploadedImages = images.map(async (image) => {
        return isLocalImage(image) ? await addImage(image.file) : image;
    });

    return Promise.allSettled(uploadedImages);
}

export async function deleteImages(images: RemoteImage[], removeImage: (id: string) => Promise<void>) {
    for (let image of images) {
        await removeImage(image.fileId);
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

export function uploadSuccessful(res: Awaited<ReturnType<typeof uploadImages>>): UploadSuccessResult | UploadFailedResult {
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

export function useUploadMissingImages() {
    const [ addImageMutation ] = useMutation<{ uploadFile: AddImageResult }>(ADD_IMAGE);
    const addImage = useCallback(async (file: File) => {
        const res = await addImageMutation({ variables: { file: file } });
        const val: RemoteImage = {
            type: 'remote',
            path: res.data!.uploadFile.file.path,
            fileId: res.data!.uploadFile.file.fileId // TODO handle error
        };
        return val;
    }, []);

    const upload = useCallback(async (images: ImageResource[]) => {
        return uploadImages(images, addImage);
    }, []);

    return upload;
}

export function useDeleteImages() {
    const [ removeImageMutation ] = useMutation(REMOVE_IMAGE);
    const removeImage = useCallback(async (fileId: string) => {
        await removeImageMutation({ variables: { fileId: fileId } });
    }, []);

    const remove = useCallback(async (images: RemoteImage[]) => {
        await deleteImages(images, removeImage);
    }, []);

    return remove;
}

export type UpdateFailedResult = UploadFailedResult;
export interface UpdateSuccessResult {
    success: true,
    value: string[]
};
export type UpdateResult = UpdateFailedResult | UpdateSuccessResult;

export function useUpdateImages() {
    const uploadImages = useUploadMissingImages();
    const deleteImages = useDeleteImages();

    const update = async (oldImages: ImageResource[], newImages: ImageResource[]): Promise<[UpdateResult, () => Promise<UpdateResult>]> => {
        let uploadedImages = newImages;

        const upload = async () => {
            const uploadResult = await uploadImages(uploadedImages);
            const uploadResultStatus = uploadSuccessful(uploadResult);
            
            if (uploadResultStatus.success) {
                uploadedImages = uploadResultStatus.value;
                const status: UpdateSuccessResult = {
                    success: true,
                    value: uploadResultStatus.value.map((img) => img.fileId)
                }
                return status;
            } else {
                uploadedImages = uploadResult.map((res, idx) => {
                    if (res.status === 'fulfilled')
                        return res.value;
                    return newImages[idx];
                });
                return uploadResultStatus;
            }
        }

        const uploadResult = await upload();
        const removedImages = getRemovedImages(oldImages, newImages);
        await deleteImages(removedImages);

        return [ uploadResult, upload ]; /* uploadResult, retry */
    }

    return update;
}