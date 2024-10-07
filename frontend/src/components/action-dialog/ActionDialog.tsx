import { ActionProps, Alert, IconName, Intent, LinkProps, MaybeElement } from "@blueprintjs/core";
import { MdRefresh } from "react-icons/md";
import { SubmitState } from "../../utils/submit-state";
import { useToaster } from "../../context/ToasterContext";
import { useState } from "react";
import { ErrorResponse, GQLResponse, SuccessResponse } from "../../hooks/response-helper";

export type Reason = 'cancel' | 'error';

export interface ActionDialogProps {
    id?: string,
    close: (state: SubmitState<Reason>) => void,
    action: (id: string) => Promise<ErrorResponse | SuccessResponse<GQLResponse>>,
    bodyText: string,
    cancelText: string,
    confirmText: string,
    icon: IconName | MaybeElement
}

export function ActionDialog(
    { id, close, action, bodyText, cancelText, confirmText, icon }: ActionDialogProps
) {
    const [ isLoading, setIsLoading ] = useState(false);

    const onExecute = async (): Promise<SubmitState<Reason>> => {
        if (!id)
            return SubmitState.SUCCESS;

        const actionResult = await action(id);
        if (!actionResult.success) {
            return new SubmitState.Error('error', onExecute);
        }
        return SubmitState.SUCCESS;
    }

    const onExecuteClick = async () => {
        setIsLoading(true);
        const state = await onExecute();
        setIsLoading(false);
        close(state);
    }

    return (
        <Alert cancelButtonText={cancelText} confirmButtonText={confirmText}
            intent='danger' icon={icon} isOpen={!!id} onCancel={() => close(new SubmitState.Error<Reason>('cancel'))}
            onConfirm={onExecuteClick} canEscapeKeyCancel canOutsideClickCancel loading={isLoading}>
            <p>
                {bodyText}
            </p>
        </Alert>
    );
}

export type ActionDialogWithRetryToastProps = Omit<ActionDialogProps, 'close'> & {
    setId: (id: string | undefined) => void,
    toasterMessageSuccess: string,
    toasterMessageError: string,
    toasterMessageRetry: string,
    toasterMessageLoading: string
}

export function ActionDialogWithRetryToast({
    setId,
    toasterMessageSuccess,
    toasterMessageError,
    toasterMessageRetry,
    toasterMessageLoading,
    ...dialogProps
}: ActionDialogWithRetryToastProps) {
    const toaster = useToaster();

    const onActionDialogClose = (state: SubmitState<Reason>) => {
        setId(undefined);

        if (state.type === 'success') {
            toaster.show({
                message: toasterMessageSuccess,
                intent: Intent.SUCCESS
            });
            return;
        }

        if (state.data === 'cancel') {
            return;
        }

        let action: (ActionProps & LinkProps) | undefined = undefined;
        if (state.retry) {
            const onRetryClick = async () => {
                if (!state.retry) {
                    return;
                }

                const loadingToastKey = toaster.show({
                    message: toasterMessageLoading,
                    timeout: 0,
                    isCloseButtonShown: false
                });
                const submitState = await state.retry(state.data);
                toaster.dismiss(loadingToastKey);
                onActionDialogClose(submitState);
            }

            action = {
                text: toasterMessageRetry,
                icon: <MdRefresh />,
                onClick: onRetryClick
            }
        }

        toaster.show({
            message: toasterMessageError,
            intent: Intent.DANGER,
            action: action
        });
    }

    return <ActionDialog close={onActionDialogClose} {...dialogProps} />
}