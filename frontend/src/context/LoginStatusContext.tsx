import { Dispatch, ReactNode, createContext, useContext, useEffect, useState } from "react";
import { LoginStatus } from "../models/login-status.model";
import { useCheckSession, useGetUserLazy } from "../hooks/user-helper";

interface LoginStatusDispatcherAction {
    type: 'login' | 'logout' | 'update';
}

export const LoginStatusContext = createContext<LoginStatus.Status>({ loggedIn: false });
export const LoginStatusDispatcherContext = createContext<Dispatch<LoginStatusDispatcherAction>>(() => {});

export function LoginStatusProvider({ children }: { children: ReactNode }) {
    const [ checkSession ] = useCheckSession();
    const getUserInfo = useGetUserLazy();
    const [ loginStatus, setLoginStatus ] = useState<LoginStatus.Status>({ loggedIn: false });
    const [ shouldCheck, setShouldCheck ] = useState(0);
    
    useEffect(() => {
        // TODO optimize: only when window in foreground
        let id: number;

        const updateSessionData = async () => {
            const sessionRes = await checkSession();
            if (!sessionRes.success) {
                setLoginStatus({ loggedIn: false });
                return;
            }

            const userInfo = await getUserInfo({ variables: { userId: sessionRes.userId } });
            if (!userInfo.success || !userInfo.data) {
                // TODO: log error
                setLoginStatus({ loggedIn: false });
                return;
            }

            setLoginStatus({ loggedIn: true, user: userInfo.data });
        }

        const checkStatus = (timeoutMs: number) => window.setTimeout(async () => {
            await updateSessionData();
            id = checkStatus(1000 * 60);
        }, timeoutMs);
        id = checkStatus(0);

        return () => { id && window.clearTimeout(id) };
    }, [shouldCheck]);

    const handleLoginStatusAction = (action: LoginStatusDispatcherAction) => {
        setShouldCheck(shouldCheck + 1);
    }

    return (
        <LoginStatusContext.Provider value={loginStatus}>
            <LoginStatusDispatcherContext.Provider value={handleLoginStatusAction}>
                { children }
            </LoginStatusDispatcherContext.Provider>
        </LoginStatusContext.Provider>
    );
}

export function useLoginStatus() {
    return useContext(LoginStatusContext);
}

export function useLoginStatusDispatcher() {
    return useContext(LoginStatusDispatcherContext);
}