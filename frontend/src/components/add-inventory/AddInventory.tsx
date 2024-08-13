import '../../styles/style.css';
import './AddInventory.css';
import { AddInventoryItem } from '../../models/InventoryItem.model';
import { ModifyInventory } from '../modify-inventory/ModifyInventory';
import { UpdateFailedResult, UpdateResult, useUpdateImages } from '../../hooks/image-helpers';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddPhysicalObject } from '../../hooks/pysical-object-helpers';

export function AddInventory() {
    const navigate = useNavigate();

    const updateImages = useUpdateImages();
    const [ addPhysicalObject ] = useAddPhysicalObject();
    const [ status, setStatus ] = useState<({ retry: () => void }) | undefined>(undefined);

    const submit = async (values: AddInventoryItem) => {
        let [ imageResult, retry ] = await updateImages([], values.images);
        let addObjResult;

        const retryAll = async () => {
            if (!imageResult.success) {
                imageResult = await retry();
            }
            if (!imageResult.success) {
                return; // error
            }
            addObjResult = await addPhysicalObject({
                variables: {
                    invNumInternal: values.inventoryNumberInternal ?? 0, // TODO: mandatory field
                    invNumExternal: values.inventoryNumberExternal ?? 0, // TODO: mandatory field
                    storageLocation: values.storageLocation,
                    name: values.name,
                    description: values.description,
                    deposit: values.deposit,
                    faults: values.defects,
                    tags: [],
                    pictures: imageResult.value,
                    borrowable: values.borrowable,
                    organizationId: "123", // TODO ?
                    storageLocation2: ""
                }
            });
            if (!addObjResult.success) {
                console.error(addObjResult);
                return // TODO show error
            }

            navigate('/');
        }

        console.error(imageResult);

        if (imageResult.success) {
            addObjResult = await addPhysicalObject({
                variables: {
                    invNumInternal: values.inventoryNumberInternal ?? 0, // TODO: mandatory field
                    invNumExternal: values.inventoryNumberExternal ?? 0, // TODO: mandatory field
                    storageLocation: values.storageLocation,
                    name: values.name,
                    description: values.description,
                    deposit: values.deposit,
                    faults: values.defects,
                    tags: [],
                    pictures: imageResult.value,
                    borrowable: values.borrowable,
                    organizationId: "123",
                    storageLocation2: ""
                }
            });
            if (!addObjResult.success) {
                console.error(addObjResult)
                setStatus({ retry: retryAll });
                return // TODO show error
            }

            navigate('/');
        } else {
            setStatus({retry: retryAll });
        }
    }

    return (
        <>
        { status && <ErrorView retry={status.retry} /> }
        { !status && <ModifyInventory initialValue={{ name: '', description: '', defects: '', storageLocation: '', borrowable: true, images: [] }}
            onClick={submit} label='Add Item' /> }
        </>
    );
}

export function ErrorView({ retry }: { retry: () => void }) {
    return (
        <div>
            Couldnt add item!
            <button onClick={retry}>Retry</button>
        </div>
    );
}
