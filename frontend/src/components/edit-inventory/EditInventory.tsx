import { gql, useSuspenseQuery } from "@apollo/client";
import { Suspense, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddInventoryItem } from "../../models/InventoryItem.model";
import { ModifyInventory } from "../modify-inventory/ModifyInventory";
import { useTitle } from "../../hooks/use-title";
import { useUpdateFiles } from "../../hooks/image-helpers";
import { useEditPhysicalObject } from "../../hooks/pysical-object-helpers";

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

    const submit = async (val: AddInventoryItem) => {
        console.error(initialValue);
        console.error(val);
        
        const [ imageResult, retryImages ] = await updateFiles(initialValue?.images ?? [], val.images);
        const [ manualsResult, retryManuals ] = await updateFiles(initialValue?.manuals ?? [], val.manuals);
        if (imageResult.success && manualsResult.success) {
            const editResult = await editPhysicalObject({
                variables: {
                    physId: itemId,
                    invNumInternal: val.inventoryNumberInternal, invNumExternal: val.inventoryNumberExternal,
                    storageLocation: val.storageLocation,
                    name: val.name, deposit: val.deposit,
                    faults: val.defects ?? '', description: val.description ?? '',
                    pictures: imageResult.value,
                    manuals: manualsResult.value,
                    borrowable: val.borrowable,
                    storageLocation2: val.storageLocation2
                }
            });

            if (editResult.success)
                navigate('/');
            else {
                console.error("couldnt update") // TODO error handling
            }
        } else {
            // TODO error handling
        }
    }

    return (
        <>
            <ModifyInventory initialValue={initialValue} label='Save changes' onClick={submit} />
        </>
    );
}