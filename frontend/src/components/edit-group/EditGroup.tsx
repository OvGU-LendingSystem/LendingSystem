import { useNavigate, useParams } from "react-router-dom";
import { EditGroupResponse, useEditGroupMutation, useGetAddGroupItemByIdQuery } from "../../hooks/group-helpers";
import { AddGroupItem } from "../../models/group.model";
import { ModifyGroup } from "../modify-group/ModifyGroup";
import { useTitle } from "../../hooks/use-title";
import { Suspense } from "react";
import { useUpdateFiles } from "../../hooks/image-helpers";
import { ErrorResponse, SuccessResponse } from "../../hooks/response-helper";
import { SubmitState } from "../../utils/submit-state";
import { useToaster } from "../../context/ToasterContext";
import { Button, NonIdealState } from "@blueprintjs/core";
import { MdPriorityHigh } from "react-icons/md";

interface EditGroupRetryData {
    imageStatus: Awaited<ReturnType<ReturnType<typeof useUpdateFiles>>>,
    editGroupResult?: {
        success: boolean;
        info: any;
    },
    editGroup: (images: string[]) => Promise<SuccessResponse<EditGroupResponse> | ErrorResponse>
}

const retry = async (data: EditGroupRetryData): Promise<SubmitState<EditGroupRetryData>> => {
    let [ imageResult, retryImages ] = data.imageStatus;
    if (!imageResult.success)
        imageResult = await retryImages();

    if (!imageResult.success) {
        return new SubmitState.Error({
            imageStatus: [imageResult, retryImages],
            editGroup: data.editGroup
        }, retry);
    }

    const editGroupResult = await data.editGroup(imageResult.value);
    if (editGroupResult.success)
        return SubmitState.SUCCESS;

    return new SubmitState.Error({
        imageStatus: [imageResult, retryImages],
        editGroupResult,
        editGroup: data.editGroup
    }, retry);

}

export function EditGroup() {
    useTitle('Gruppe bearbeiten');
    
    const params = useParams<'groupId'>();
    const navigate = useNavigate();

    if (params['groupId'] === undefined) {
        navigate('/');
        return <></>;
    }
    
    return (
        <Suspense>
            <EditGroupScreen groupId={params['groupId']} />
        </Suspense>
    );
}

function EditGroupScreen({ groupId }: { groupId: string }) {
    const navigate = useNavigate();
    const toaster = useToaster();
    const [ editGroup ] = useEditGroupMutation();
    const updateFiles = useUpdateFiles();
    const { data } = useGetAddGroupItemByIdQuery(groupId);

    const submit = async (value: AddGroupItem): Promise<SubmitState<EditGroupRetryData>> => {
        let [ imageResult, retryImages ] = await updateFiles(data?.pictures ?? [], value.pictures);
        const editGroupFn = async (images: string[]) => {
            return await editGroup({ variables: { groupId: groupId, name: value.name, description: value.description, pictures: images, physicalObjects: value.physicalObjectIds } });
        }
        if (!imageResult.success) {
            return new SubmitState.Error({
                imageStatus: [imageResult, retryImages],
                editGroup: editGroupFn
            }, retry);
        }

        const result = await editGroupFn(imageResult.value);
        if (result.success) {
            return SubmitState.SUCCESS;
        }

        return new SubmitState.Error({
            imageStatus: [imageResult, retryImages],
            editGroupResult: result,
            editGroup: editGroupFn
        }, retry);
    }

    const onSuccess = () => {
        navigate('/internal/inventory');
        toaster.show({ message: 'Gruppe erfolgreich aktualisiert', intent: 'success' });
    }
    
    return (
        <>
            <ModifyGroup initialValue={data} label='Änderungen speichern' onSubmit={submit}
                onSuccess={onSuccess} ErrorScreen={EditGroupErrorScreen} />
        </>
    );
}

function EditGroupErrorScreen({ data, retry }: { data: EditGroupRetryData, retry: () => void }) {
    return (
        <NonIdealState title='Fehler' description='Gruppe konnte nicht aktualisiert werden'
            action={<Button onClick={retry} intent='primary'>Erneut versuchen</Button>} icon={<MdPriorityHigh color='red' />} />
    );
}