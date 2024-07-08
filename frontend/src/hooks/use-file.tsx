import { useEffect, useState } from "react";

export function useFile(initialFile: File): [ File, string, React.Dispatch<React.SetStateAction<File>> ] {
    const [ file, setFile ] = useState<File>(initialFile);
    const [ fileUrl, setFileUrl ] = useState<string>('');

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setFileUrl(url);

        return () => {
            if (url !== null) {
                URL.revokeObjectURL(url);
            }
        };
    } , [file]);

    return [ file, fileUrl, setFile ];
}