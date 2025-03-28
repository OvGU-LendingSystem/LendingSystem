import { Dispatch, ReactNode, createContext, useContext, useEffect, useState } from "react";
import { LoginStatus } from "../models/login-status.model";
import { useCheckSession, useGetUserLazy, useLogout } from "../hooks/user-helper";
import { NotLoggedInError } from "../models/user-login-error";
import { useApolloClient } from "@apollo/client";

interface LoginStatusDispatcherAction {
    type: 'login' | 'logout' | 'update';
}

export const LoginStatusContext = createContext<LoginStatus.Status>({ loggedIn: false });
export const LoginStatusDispatcherContext = createContext<Dispatch<LoginStatusDispatcherAction>>(() => {});

export function LoginStatusProvider({ children }: { children: ReactNode }) {
    const [ checkSession ] = useCheckSession();
    const getUserInfo = useGetUserLazy();
    const client = useApolloClient();
    const [ loginStatus, setLoginStatus ] = useState<LoginStatus.Status>({ loggedIn: false });
    const [ shouldCheck, setShouldCheck ] = useState(0);
    const [ visible, setVisible ] = useState<boolean>(!document.hidden);
    const [ loaded, setLoaded ] = useState<boolean>(false);
    const [logoutMutation] = useLogout();
    
    useEffect(() => {
        let id: number;

        const updateSessionData = async () => {
            const sessionRes = await checkSession();
            if (!sessionRes.success) {
                setLoginStatus({ loggedIn: false });
                return;
            }

            const userInfo = await getUserInfo({
                variables: { userId: sessionRes.userId },
                fetchPolicy: 'network-only'
            });
            if (!userInfo.success || !userInfo.data) {
                // TODO: log error
                setLoginStatus({ loggedIn: false });
                return;
            }

            setLoginStatus({ loggedIn: true, user: userInfo.data });
        }

        const checkStatus = (timeoutMs: number) => window.setTimeout(async () => {
            await updateSessionData();
            setLoaded(true);
            id = checkStatus(1000 * 60);
        }, timeoutMs);

        if (visible) {
            id = checkStatus(0);
        } else {
            updateSessionData();
        }

        return () => { id && window.clearTimeout(id) };
    }, [shouldCheck, visible]);

    useEffect(() => {
        const visibilityChangeListener = () => {
            setVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', visibilityChangeListener);

        return () => {
            document.removeEventListener('visibilitychange', visibilityChangeListener);
        };
    }, []);

    const handleLoginStatusAction = async (action: LoginStatusDispatcherAction) => {
        setShouldCheck(shouldCheck + 1);
        client.resetStore();
        if (action.type === "logout") {
            try {
                const response = await logoutMutation();
                setLoginStatus({ loggedIn: false });
                if (response.success) {
                    setLoginStatus({ loggedIn: false });
                } else {
                    console.error("Logout failed:", response);
                }
                setShouldCheck((prev) => prev + 1);
            } catch (error) {
                console.error("Logout failed:", error);
            }
        } else {
            setShouldCheck((prev) => prev + 1);
        }
    };

 
        
    

    return (
        <LoginStatusContext.Provider value={loginStatus}>
            <LoginStatusDispatcherContext.Provider value={handleLoginStatusAction}>
                { loaded && children }
            </LoginStatusDispatcherContext.Provider>
        </LoginStatusContext.Provider>
    );
}

export function useLoginStatus() {
    return useContext(LoginStatusContext);
}

export function useUserInfo() {
    const status = useLoginStatus();
    if (!status.loggedIn) {
        throw new NotLoggedInError();
    }

    return status.user;
}

export function useLoginStatusDispatcher() {
    return useContext(LoginStatusDispatcherContext);
}