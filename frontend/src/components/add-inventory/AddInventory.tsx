import '../../styles/style.css';
import { AddInventoryItem } from '../../models/InventoryItem.model';
import { ModifyInventory } from '../modify-inventory/ModifyInventory';
import { useUpdateFiles } from '../../hooks/image-helpers';
import { useNavigate, useParams } from 'react-router-dom';
import { AddPhysicalObjectResponse, useAddPhysicalObject } from '../../hooks/pysical-object-helpers';
import { ErrorResponse, SuccessResponse } from '../../hooks/response-helper';
import { Button, NonIdealState } from '@blueprintjs/core';
import { MdPriorityHigh } from 'react-icons/md';
import { useToaster } from '../../context/ToasterContext';
import { SubmitState } from '../../utils/submit-state';
import { useUpdateTags } from '../../hooks/tag-helpers';

interface AddInventoryRetryData {
    imageStatus: Awaited<ReturnType<ReturnType<typeof useUpdateFiles>>>,
    manualsStatus: Awaited<ReturnType<ReturnType<typeof useUpdateFiles>>>,
    tagsStatus: Awaited<ReturnType<ReturnType<typeof useUpdateTags>>>,
    addObjectResult?: {
        success: boolean;
        info: any;
    },
    addObject: (images: string[], manuals: string[], tags: string[]) => Promise<SuccessResponse<AddPhysicalObjectResponse> | ErrorResponse>
}

const retry = async (data: AddInventoryRetryData): Promise<SubmitState<AddInventoryRetryData>> => {
    let [ imageResult, retryImages ] = data.imageStatus;
    let [ manualsResult, retryManuals ] = data.manualsStatus;
    let [ tagsResult, retryTags ] = data.tagsStatus;
    
    if (!imageResult.success)
        imageResult = await retryImages();

    if (!manualsResult.success)
        manualsResult = await retryManuals();

    if (!tagsResult.success)
        tagsResult = await retryTags();

    if (!imageResult.success || !manualsResult.success || !tagsResult.success) {
        return new SubmitState.Error({
            imageStatus: [imageResult, retryImages],
            manualsStatus: [manualsResult, retryManuals],
            tagsStatus: [tagsResult, retryTags],
            addObject: data.addObject
        }, retry);
    }

    const addObjectResult = await data.addObject(imageResult.value, manualsResult.value, tagsResult.value);
    if (addObjectResult.success)
        return SubmitState.SUCCESS;

    return new SubmitState.Error({
        imageStatus: [imageResult, retryImages],
        manualsStatus: [manualsResult, retryManuals],
        tagsStatus: [tagsResult, retryTags],
        addObjectResult,
        addObject: data.addObject
    }, retry);
}

export function AddInventory() {
    const navigate = useNavigate();
    const { orgId } = useParams();
    const toaster = useToaster();

    if (!orgId) {
        throw Error("No organization provided!");
    }

    const updateFiles = useUpdateFiles();
    const updateTags = useUpdateTags();
    const [ addPhysicalObject ] = useAddPhysicalObject();

    const submit = async (values: AddInventoryItem): Promise<SubmitState<AddInventoryRetryData>> => {
        let [ imageResult, retryImages ] = await updateFiles([], values.images);
        let [ manualsResult, retryManuals ] = await updateFiles([], values.manuals);
        let [ tagsResult, retryTags ] = await updateTags(values.tags);

        const addObject = async (images: string[], manuals: string[], tags: string[]): Promise<SuccessResponse<AddPhysicalObjectResponse> | ErrorResponse> => {
            return await addPhysicalObject({
                variables: {
                    invNumInternal: values.inventoryNumberInternal ?? 0, // TODO: mandatory field
                    invNumExternal: values.inventoryNumberExternal ?? 0, // TODO: mandatory field
                    storageLocation: values.storageLocation,
                    name: values.name,
                    description: values.description,
                    deposit: values.deposit,
                    faults: values.defects,
                    tags: tags,
                    pictures: images,
                    manuals: manuals,
                    borrowable: values.borrowable,
                    organizationId: values.organizationId,
                    storageLocation2: values.storageLocation2
                }
            });
        }

        if (imageResult.success && manualsResult.success && tagsResult.success) {
            const addObjResult = await addObject(imageResult.value, manualsResult.value, tagsResult.value);
            if (!addObjResult.success) {
                return new SubmitState.Error<AddInventoryRetryData>({
                    imageStatus: [imageResult, retryImages],
                    manualsStatus: [manualsResult, retryManuals],
                    tagsStatus: [tagsResult, retryTags],
                    addObjectResult: addObjResult,
                    addObject: addObject
                }, retry);
            }

            return SubmitState.SUCCESS;
        }

        return new SubmitState.Error({
            imageStatus: [imageResult, retryImages],
            manualsStatus: [manualsResult, retryManuals],
            tagsStatus: [tagsResult, retryTags],
            addObject: addObject
        }, retry);
    }

    const onSuccess = () => {
        navigate('/internal/inventory');
        toaster.show({ message: 'Objekt erfolgreich erstellt', intent: 'success' });
    }

    return (
        <ModifyInventory initialValue={{ organizationId: orgId, name: '', description: '', defects: '', storageLocation: '', storageLocation2: '', borrowable: true, deposit: 0, images: [], manuals: [], tags: [] }}
            ErrorScreen={AddInventoryErrorView} onClick={submit} label='Add Item' onSuccess={onSuccess} />
    );
}

function AddInventoryErrorView({ data, retry }: { data: AddInventoryRetryData, retry: () => void }) {
    return (
        <NonIdealState title='Fehler' description='Objekt konnte nicht gespeichert werden'
            action={<Button onClick={retry} intent='primary'>Erneut versuchen</Button>} icon={<MdPriorityHigh color='red' />} />
    );
}
