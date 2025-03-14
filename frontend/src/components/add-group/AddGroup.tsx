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
import { useUpdateTags } from "../../hooks/tag-helpers";

interface AddGroupRetryData {
    imageStatus: Awaited<ReturnType<ReturnType<typeof useUpdateFiles>>>,
    tagStatus: Awaited<ReturnType<ReturnType<typeof useUpdateTags>>>,
    addGroupResult?: {
        success: boolean;
        info: any;
    },
    addGroup: (images: string[], tags: string[]) => Promise<SuccessResponse<AddGroupResponse> | ErrorResponse>
}

const retry = async (data: AddGroupRetryData): Promise<SubmitState<AddGroupRetryData>> => {
    let [ imageResult, retryImages ] = data.imageStatus;
    let [ tagResult, retryTags ] = data.imageStatus;
    if (!imageResult.success)
        imageResult = await retryImages();

    if (!tagResult.success)
        tagResult = await retryTags();

    if (!imageResult.success || !tagResult.success) {
        return new SubmitState.Error({
            imageStatus: [imageResult, retryImages],
            tagStatus: [tagResult, retryTags],
            addGroup: data.addGroup
        }, retry);
    }

    const addGroupResult = await data.addGroup(imageResult.value, tagResult.value);
    if (addGroupResult.success)
        return SubmitState.SUCCESS;

    return new SubmitState.Error({
        imageStatus: [imageResult, retryImages],
        tagStatus: [tagResult, retryTags],
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
    const updateTags = useUpdateTags();

    if (!orgId) {
        throw Error("No organization provided!");
    }

    const initialValue: AddGroupItem = {
        name: '', description: '', pictures: [], physicalObjectIds: [], orgId: orgId, tags: []
    }

    const submit = async (value: AddGroupItem): Promise<SubmitState<AddGroupRetryData>> => {
        let [ imageResult, retryImages ] = await updateFiles([], value.pictures);
        let [ tagResult, retryTags ] = await updateTags(value.tags);

        const addGroupFn = async (images: string[], tags: string[]) => {
            return await addGroup({ variables: { 
                name: value.name,
                description: value.description,
                pictures: images,
                physicalObjects: value.physicalObjectIds,
                organizationId: value.orgId,
                tags: tags
            } });
        }
        if (!imageResult.success || !tagResult.success) {
            return new SubmitState.Error({
                imageStatus: [imageResult, retryImages],
                tagStatus: [tagResult, retryTags],
                addGroup: addGroupFn
            }, retry);
        }

        const result = await addGroupFn(imageResult.value, tagResult.value);
        if (result.success) {
            return SubmitState.SUCCESS;
        }

        return new SubmitState.Error({
            imageStatus: [imageResult, retryImages],
            tagStatus: [tagResult, retryTags],
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