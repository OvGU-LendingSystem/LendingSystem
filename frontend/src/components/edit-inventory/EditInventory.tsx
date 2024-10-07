import { gql, useSuspenseQuery } from "@apollo/client";
import { Suspense, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddInventoryItem } from "../../models/InventoryItem.model";
import { ModifyInventory } from "../modify-inventory/ModifyInventory";
import { useTitle } from "../../hooks/use-title";
import { useUpdateFiles } from "../../hooks/image-helpers";
import { EditPhysicalObjectResponse, useEditPhysicalObject } from "../../hooks/pysical-object-helpers";
import { ErrorResponse, SuccessResponse } from "../../hooks/response-helper";
import { useToaster } from "../../context/ToasterContext";
import { Button, NonIdealState } from "@blueprintjs/core";
import { MdPriorityHigh } from "react-icons/md";
import { SubmitState } from "../../utils/submit-state";

const GET_ITEM = gql`
    query GetPhysicalObject($id: String!) {
        filterPhysicalObjects(physId: $id) {
            physId,
            invNumInternal,
            invNumExternal,
            borrowable,
            storageLocation,
            name,
            deposit,
            faults,
            description,
            borrowable,
            storageLocation2,
            manual {
                edges {
                    node {
                        path,
                        fileId
                    }
                }
            },
            pictures {
                edges {
                    node {
                        path,
                        fileId
                    }
                }
            }
        }
    }
`;

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

interface GetItemResponse {
    filterPhysicalObjects: {
        name: string, borrowable: boolean, storageLocation: string, description: string,
        faults: string,
        invNumInternal: number,
        invNumExternal: number,
        storageLocation2: string,
        manual: {
            edges: {
                node: {
                    path: string,
                    fileId: string
                }
            }[]
        },
        pictures: {
            edges: {
                node: {
                    path: string,
                    fileId: string
                }
            }[]
        }
    }[]
}

function EditInventoryScreen({ itemId }: EditInventoryScreenProps) {
    const { data } = useSuspenseQuery<GetItemResponse>(GET_ITEM, { variables: { id: itemId }});
    const initialValue = useMemo(() => {
        const val: AddInventoryItem = {
            ...data.filterPhysicalObjects[0],
            defects: data.filterPhysicalObjects[0].faults,
            inventoryNumberInternal: data.filterPhysicalObjects[0].invNumInternal,
            inventoryNumberExternal: data.filterPhysicalObjects[0].invNumExternal,
            images: [],
            manuals: []
        };
        val.images = data.filterPhysicalObjects[0].pictures.edges.map((node: any) => {
            return { type: 'remote', path: node.node.path, fileId: node.node.fileId };
        });
        val.manuals = data.filterPhysicalObjects[0].manual.edges.map((node: any) => {
            return { type: 'remote', path: node.node.path, fileId: node.node.fileId };
        });
        return val;
    }, [data]);

    const [ editPhysicalObject ] = useEditPhysicalObject();
    const updateFiles = useUpdateFiles();
    const navigate = useNavigate();
    const toaster = useToaster();

    const submit = async (val: AddInventoryItem): Promise<SubmitState<EditInventoryRetryData>> => {        
        const [ imageResult, retryImages ] = await updateFiles(initialValue?.images ?? [], val.images);
        const [ manualsResult, retryManuals ] = await updateFiles(initialValue?.manuals ?? [], val.manuals);

        const editObject = async (images: string[], manuals: string[]) => {
            return await editPhysicalObject({
                variables: {
                    physId: itemId,
                    invNumInternal: val.inventoryNumberInternal, invNumExternal: val.inventoryNumberExternal,
                    storageLocation: val.storageLocation,
                    name: val.name, deposit: val.deposit,
                    faults: val.defects ?? '', description: val.description ?? '',
                    pictures: images,
                    manuals: manuals,
                    borrowable: val.borrowable,
                    storageLocation2: val.storageLocation2
                }
            });
        }

        if (imageResult.success && manualsResult.success) {
            const editResult = await editObject(imageResult.value, manualsResult.value);

            if (editResult.success)
                return SubmitState.SUCCESS;

            return new SubmitState.Error({
                imageStatus: [ imageResult, retryImages ],
                manualsStatus: [ manualsResult, retryManuals ],
                editObjectResult: editResult,
                editObject: editObject
            }, retry);
            
        }

        return new SubmitState.Error({
            imageStatus: [ imageResult, retryImages ],
            manualsStatus: [ manualsResult, retryManuals ],
            editObject: editObject
        }, retry);
    }

    const onSuccess = () => {
        navigate('/');
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
    editObjectResult?: {
        success: boolean;
        info: any;
    },
    editObject: (images: string[], manuals: string[]) => Promise<SuccessResponse<EditPhysicalObjectResponse> | ErrorResponse>

}

const retry = async (data: EditInventoryRetryData): Promise<SubmitState<EditInventoryRetryData>> => {
    let [ imageResult, retryImages ] = data.imageStatus;
    let [ manualsResult, retryManuals ] = data.manualsStatus;
    
    if (!imageResult.success)
        imageResult = await retryImages();

    if (!manualsResult.success)
        manualsResult = await retryManuals();

    if (!imageResult.success || !manualsResult.success) {
        return new SubmitState.Error({
            imageStatus: [imageResult, retryImages],
            manualsStatus: [manualsResult, retryManuals],
            editObject: data.editObject
        }, retry);
    }

    const editObjectResult = await data.editObject(imageResult.value, manualsResult.value);
    if (editObjectResult.success)
        return SubmitState.SUCCESS;

    return new SubmitState.Error({
        imageStatus: [imageResult, retryImages],
        manualsStatus: [manualsResult, retryManuals],
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