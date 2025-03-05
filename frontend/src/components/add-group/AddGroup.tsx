import { useNavigate, useParams } from "react-router-dom";
import { AddGroupResponse, useAddGroupMutation } from "../../hooks/group-helpers";
import { AddGroupItem } from "../../models/group.model";
import { ModifyGroup } from "../modify-group/ModifyGroup";
import { useTitle } from "../../hooks/use-title";
import { useUpdateFiles } from "../../hooks/image-helpers";
import { ErrorResponse, SuccessResponse } from "../../hooks/response-helper";
import { SubmitState } from "../../utils/submit-state";
import { useToaster } from "../../context/ToasterContext";
import { MdPriorityHigh } from "react-icons/md";
import { Button, NonIdealState } from "@blueprintjs/core";

interface AddGroupRetryData {
    imageStatus: Awaited<ReturnType<ReturnType<typeof useUpdateFiles>>>,
    addGroupResult?: {
        success: boolean;
        info: any;
    },
    addGroup: (images: string[]) => Promise<SuccessResponse<AddGroupResponse> | ErrorResponse>
}

const retry = async (data: AddGroupRetryData): Promise<SubmitState<AddGroupRetryData>> => {
    let [ imageResult, retryImages ] = data.imageStatus;
    if (!imageResult.success)
        imageResult = await retryImages();

    if (!imageResult.success) {
        return new SubmitState.Error({
            imageStatus: [imageResult, retryImages],
            addGroup: data.addGroup
        }, retry);
    }

    const addGroupResult = await data.addGroup(imageResult.value);
    if (addGroupResult.success)
        return SubmitState.SUCCESS;

    return new SubmitState.Error({
        imageStatus: [imageResult, retryImages],
        addGroupResult,
        addGroup: data.addGroup
    }, retry);

}

export function AddGroup() {
    useTitle('Gruppe hinzufügen');
    
    const navigate = useNavigate();
    const { orgId } = useParams();
    const toaster = useToaster();
    const [ addGroup ] = useAddGroupMutation();
    const updateFiles = useUpdateFiles();

    if (!orgId) {
        throw Error("No organization provided!");
    }

    const initialValue: AddGroupItem = {
        name: '', description: '', pictures: [], physicalObjectIds: []
    }

    const submit = async (value: AddGroupItem): Promise<SubmitState<AddGroupRetryData>> => {
        let [ imageResult, retryImages ] = await updateFiles([], value.pictures);
        const addGroupFn = async (images: string[]) => {
            return await addGroup({ variables: { 
                name: value.name,
                description: value.description,
                pictures: images,
                physicalObjects: value.physicalObjectIds,
                organizationId: orgId
            } });
        }
        if (!imageResult.success) {
            return new SubmitState.Error({
                imageStatus: [imageResult, retryImages],
                addGroup: addGroupFn
            }, retry);
        }

        const result = await addGroupFn(imageResult.value);
        if (result.success) {
            return SubmitState.SUCCESS;
        }

        return new SubmitState.Error({
            imageStatus: [imageResult, retryImages],
            addGroupResult: result,
            addGroup: addGroupFn
        }, retry);
    }
    
    const onSuccess = () => {
        navigate('/internal/inventory');
        toaster.show({ message: 'Gruppe erfolgreich erstellt', intent: 'success' });
    }

    return (
        <>
            <ModifyGroup initialValue={initialValue} label='Gruppe hinzufügen' onSubmit={submit}
                ErrorScreen={AddGroupErrorView} onSuccess={onSuccess} />
        </>
    );
}

function AddGroupErrorView({ data, retry }: { data: AddGroupRetryData, retry: () => void }) {
    return (
        <NonIdealState title='Fehler' description='Gruppe konnte nicht gespeichert werden'
            action={<Button onClick={retry} intent='primary'>Erneut versuchen</Button>} icon={<MdPriorityHigh color='red' />} />
    );
}