import { useEffect, useState } from "react";

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