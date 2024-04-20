import { useEffect, useState } from "react";

export function useFile(): [ File | undefined, string, React.Dispatch<React.SetStateAction<File | undefined>> ] {
    const [ file, setFile ] = useState<File>();
    const [ fileUrl, setFileUrl ] = useState<string>('');

    useEffect(() => {
        const url = file ? URL.createObjectURL(file) : '';
        setFileUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    } , [file]);

    return [ file, fileUrl, setFile ];
}