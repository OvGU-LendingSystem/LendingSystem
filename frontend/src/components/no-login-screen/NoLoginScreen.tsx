import { NonIdealState } from "@blueprintjs/core";
import { PropsWithChildren, useEffect, useState } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { MdLogin } from "react-icons/md";
import { NotLoggedInError } from "../../models/user-login-error";
import { useLocation } from "react-router-dom";
import { useLoginStatus } from "../../context/LoginStatusContext";

export function NotLoginScreen() {
    return (
        <NonIdealState icon={<MdLogin />}
            title='Kein gültiger Login!'
            description='Um auf diese Seite zugreifen zu können muss ein Nutzer angemeldet sein.' />
    );
}

function NotLoginFallback({ error }: FallbackProps) {
    if (!(error instanceof NotLoggedInError)) {
        throw error;
    }

    return <NotLoginScreen />;
}

export function NotLoginErrorBoundary({ children }: PropsWithChildren) {
    const location = useLocation();
    const loginStatus = useLoginStatus();

    return (
        <ErrorBoundary fallbackRender={NotLoginFallback} resetKeys={[location.pathname, loginStatus]}>
            { children }
        </ErrorBoundary>
    );
}