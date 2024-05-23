import { useEffect, useState } from "react";

export function useLocalStorage<T>(
    key: string,
    defaultVal: T,
    replacer?: ((key: string, value: any) => any) | undefined,
    reviver?:  ((key: string, value: any) => any) | undefined
): [ T, (data: T) => void ] {
    const [ data, setData ] = useState<T>(defaultVal);
    const setDataWithLocalStorage = (data: T) => {
        setData(data);
        window.localStorage.setItem(key, JSON.stringify(data, replacer));
    }

    useEffect(() => {
        const storageData = window.localStorage.getItem(key);
        if (storageData === null)
            return;

        const data = JSON.parse(storageData, reviver);
        setData(data);
    }, []);

    return [ data, setDataWithLocalStorage ];
}