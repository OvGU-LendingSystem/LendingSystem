import { Dispatch, Reducer, ReducerAction, ReducerState, useEffect, useReducer, useState } from "react";

/**
 * 
 * @param key The key for saving and retrieving data in local storage.
 * @param defaultVal The initial value.
 * @param replacer A function that transforms the data before saving into local storage.
 * @param reviver A function that is called for each object when retrieving the data from local storage.
 * @returns 
 */
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

export function useLocalStorageWithReducer<T extends Reducer<any, any>>(
    key: string,
    defaultVal: ReducerState<T>,
    dispatcher: T,
    replacer?: ((key: string, value: any) => any) | undefined,
    reviver?:  ((key: string, value: any) => any) | undefined
): [ ReducerState<T>, Dispatch<ReducerAction<T>> ] {
    const getDataFromLoacalStorage = () => {
        const storageData = window.localStorage.getItem(key);
        if (storageData === null)
            return null;
        return JSON.parse(storageData, reviver) as ReducerState<T>;
    }

    const [ data, dispatch ] = useReducer<T, ReducerState<T>>(
        dispatcher,
        defaultVal,
        (initialVal: ReducerState<T>) => getDataFromLoacalStorage() ?? initialVal
    );

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(data, replacer));
    }, [data]);

    return [ data, dispatch ];
}