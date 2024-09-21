import { useEffect, useState } from "react";
import { FileResource, ImageResource } from "../models/file.model";

export function useFile(): [ File | undefined, string | null, React.Dispatch<React.SetStateAction<File | undefined>> ] {
    const [ file, setFile ] = useState<File>();
    const [ fileUrl, setFileUrl ] = useState<string | null>('');

    useEffect(() => {
        const url = file ? URL.createObjectURL(file) : null;
        setFileUrl(url);

        return () => {
            if (url !== null) {
                URL.revokeObjectURL(url);
            }
        };
    } , [file]);

    return [ file, fileUrl, setFile ];
}

function getFileUrlWithCleanupFn(image: FileResource, baseUrl: string): [ url: string, cleanup: () => void ] {
    if (image.type === 'remote')
        return [ baseUrl + image.path, () => {} ];


    const url = URL.createObjectURL(image.file);
    const cleanup = () => {
        if (url !== null) {
            URL.revokeObjectURL(url);
        }
    };
    
    return [ url, cleanup ];
}

export function useFileResource(file: FileResource, baseUrl: string) {
    const [ url, setUrl ] = useState('');
    useEffect(() => {
        const [ url, cleanup ] = getFileUrlWithCleanupFn(file, baseUrl);
        setUrl(url);
        return cleanup;
    }, [file, baseUrl]);
    return url;
}

const BASE_IMAGE_PATH = process.env.REACT_APP_PICUTRES_BASE_URL;
const BASE_PDF_PATH = process.env.REACT_APP_PDFS_BASE_URL;


export function useImageResource(file: ImageResource) {
    return useFileResource(file, BASE_IMAGE_PATH ?? '');
}

export function usePdfResource(file: FileResource) {
    return useFileResource(file, BASE_PDF_PATH ?? '');
}