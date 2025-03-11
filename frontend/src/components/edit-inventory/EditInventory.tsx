import { useSuspenseQuery } from "@apollo/client";
import { Suspense, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddInventoryItem } from "../../models/InventoryItem.model";
import { ModifyInventory } from "../modify-inventory/ModifyInventory";
import { useTitle } from "../../hooks/use-title";
import { useUpdateFiles } from "../../hooks/image-helpers";
import { EditPhysicalObjectResponse, useEditPhysicalObject, useGetAddPhysicalObject } from "../../hooks/pysical-object-helpers";
import { ErrorResponse, flattenEdges, SuccessResponse } from "../../hooks/response-helper";
import { useToaster } from "../../context/ToasterContext";
import { Button, NonIdealState } from "@blueprintjs/core";
import { MdPriorityHigh } from "react-icons/md";
import { SubmitState } from "../../utils/submit-state";
import { useUpdateTags } from "../../hooks/tag-helpers";

export function EditInventory() {
    useTitle('Edit item');
    const params = useParams<'itemId'>();
    const navigate = useNavigate();

    if (params['itemId'] === undefined) {
        navigate('/');
        return <></>;
    }
    
    return (
        <Suspense>
            <EditInventoryScreen itemId={params['itemId']} />
        </Suspense>
    );
}

interface EditInventoryScreenProps {
    itemId: string;
}

function EditInventoryScreen({ itemId }: EditInventoryScreenProps) {
    const { data: initialValue } = useGetAddPhysicalObject(itemId);
    const [ editPhysicalObject ] = useEditPhysicalObject();
    const updateFiles = useUpdateFiles();
    const updateTags = useUpdateTags();
    const navigate = useNavigate();
    const toaster = useToaster();

    const submit = async (val: AddInventoryItem): Promise<SubmitState<EditInventoryRetryData>> => {
        const [ imageResult, retryImages ] = await updateFiles(initialValue?.images ?? [], val.images);
        const [ manualsResult, retryManuals ] = await updateFiles(initialValue?.manuals ?? [], val.manuals);
        const [ tagsResult, retryTags ] = await updateTags(val.tags);

        const editObject = async (images: string[], manuals: string[], tags: string[]) => {
            return await editPhysicalObject({
                variables: {
                    physId: itemId,
                    invNumInternal: val.inventoryNumberInternal ?? 0,
                    invNumExternal: val.inventoryNumberExternal ?? 0,
                    storageLocation: val.storageLocation,
                    name: val.name, deposit: val.deposit,
                    faults: val.defects ?? '',
                    description: val.description ?? '',
                    pictures: images,
                    manuals: manuals,
                    tags: tags,
                    borrowable: val.borrowable,
                    storageLocation2: val.storageLocation2
                }
            });
        }

        if (imageResult.success && manualsResult.success && tagsResult.success) {
            const editResult = await editObject(imageResult.value, manualsResult.value, tagsResult.value);

            if (editResult.success)
                return SubmitState.SUCCESS;

            return new SubmitState.Error({
                imageStatus: [ imageResult, retryImages ],
                manualsStatus: [ manualsResult, retryManuals ],
                tagsStatus: [ tagsResult, retryTags ],
                editObjectResult: editResult,
                editObject: editObject
            }, retry);
            
        }

        return new SubmitState.Error({
            imageStatus: [ imageResult, retryImages ],
            manualsStatus: [ manualsResult, retryManuals ],
            tagsStatus: [ tagsResult, retryTags ],
            editObject: editObject
        }, retry);
    }

    const onSuccess = () => {
        navigate('/internal/inventory');
        toaster.show({ message: 'Objekt erfolgreich aktualisiert', intent: 'success' });
    }

    return (
        <ModifyInventory initialValue={initialValue} label='Save changes' onClick={submit}
            onSuccess={onSuccess} ErrorScreen={EditObjectErrorScreen} />
    );
}

interface EditInventoryRetryData {
    imageStatus: Awaited<ReturnType<ReturnType<typeof useUpdateFiles>>>,
    manualsStatus: Awaited<ReturnType<ReturnType<typeof useUpdateFiles>>>,
    tagsStatus: Awaited<ReturnType<ReturnType<typeof useUpdateTags>>>,
    editObjectResult?: {
        success: boolean;
        info: any;
    },
    editObject: (images: string[], manuals: string[], tags: string[]) => Promise<SuccessResponse<EditPhysicalObjectResponse> | ErrorResponse>

}

const retry = async (data: EditInventoryRetryData): Promise<SubmitState<EditInventoryRetryData>> => {
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
            editObject: data.editObject
        }, retry);
    }

    const editObjectResult = await data.editObject(imageResult.value, manualsResult.value, tagsResult.value);
    if (editObjectResult.success)
        return SubmitState.SUCCESS;

    return new SubmitState.Error({
        imageStatus: [imageResult, retryImages],
        manualsStatus: [manualsResult, retryManuals],
        tagsStatus: [tagsResult, retryTags],
        editObjectResult,
        editObject: data.editObject
    }, retry);
}

function EditObjectErrorScreen({ data, retry }: { data: EditInventoryRetryData, retry: () => void }) {
    return (
        <NonIdealState title='Fehler' description='Objekt konnte nicht aktualisiert werden'
            action={<Button onClick={retry} intent='primary'>Erneut versuchen</Button>} icon={<MdPriorityHigh color='red' />} />
    );
}