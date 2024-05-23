import { useEffect, useState } from "react";

export function useFiles(): [ File[], string[], React.Dispatch<React.SetStateAction<File[]>> ] {
    const [ files, setFiles ] = useState<File[]>([]);
    const [ fileUrls, setFileUrls ] = useState<string[]>([]);

    useEffect(() => {
        setFileUrls(files.map(file => URL.createObjectURL(file)));

        return () => {
            fileUrls.forEach(url => URL.revokeObjectURL(url));
        }
    } , [files]);

    const fileData = zip(files, fileUrls);

    return [ /*fileData*/ files, fileUrls, setFiles ];
}

function zip<S, T>(arr1: S[], arr2: T[]): [S, T][] {
    return arr1.map((val, i) => [val, arr2[i]]);
}