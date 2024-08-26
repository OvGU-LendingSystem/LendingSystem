import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { NonIdealState, OverlayToaster, Spinner, Toaster } from "@blueprintjs/core";
import { createRoot } from "react-dom/client";

export const ToasterContext = createContext<Toaster | undefined>(undefined);

export function ToasterProvider({ children }: { children: ReactNode }) {
    const [toaster, setToaster] = useState<Toaster>();
    useEffect(() => {
        OverlayToaster.createAsync(
            { position: "bottom" },
            { domRenderer: (toaster, containerElement) => createRoot(containerElement).render(toaster) }
        ).then((toaster) => setToaster(toaster));
    }, []);

    if (!toaster) {
        return (<NonIdealState icon={<Spinner />} />);
    }

    return (
        <ToasterContext.Provider value={toaster}>
            { children }
        </ToasterContext.Provider>
    );
}

export function useToaster() {
    const context = useContext(ToasterContext);
    if (context === undefined)
        throw new Error('Toaster context is undefined');
    return context;
}