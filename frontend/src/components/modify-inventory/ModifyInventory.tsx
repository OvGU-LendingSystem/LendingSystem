import '../../styles/style.css';
import './ModifyInventory.css';
import { FormikHelpers, Formik, FormikProps, Field, Form } from "formik";
import { FormikInput, FormikSelectionInputWithCustomInput, FormikTextarea } from "../../core/input/Input";
import { AddInventoryItem } from "../../models/InventoryItem.model";
import { FormikImagesSelectorComponent } from "../image-selector-with-preview/ImageSelectorWithPreview";
import { FormikFileSelector } from '../file-selector/FileSelector';
import { useStorageLocationHelper } from '../../hooks/storage-location-helper';
import { Suspense } from 'react';

export interface ModifyInventoryProps {
    initialValue: AddInventoryItem,
    label: string,
    onClick: (values: AddInventoryItem) => Promise<void>
}

export function ModifyInventory(props: ModifyInventoryProps) {
    return (
        <Suspense>
            <ModifyInventoryScreen {...props} />
        </Suspense>
    );
}

export function ModifyInventoryScreen({ initialValue, label, onClick }: ModifyInventoryProps) {
    const { data } = useStorageLocationHelper();
    //const storagePlaces = ["Keller", "1. Etage", "2. Etage"];
    //const storagePlaces2 = ["Regal 1", "Regal 2"];

    const updateDeposit = (e: React.ChangeEvent<HTMLInputElement>) => {
        return Math.trunc(e.target.valueAsNumber * 100);
    }

    const getDeposit = (val: number) => {
        return new Intl.NumberFormat(undefined, ({ maximumFractionDigits: 2, useGrouping: false })).format(val / 100);
    }

    const submit = async (values: AddInventoryItem, _: FormikHelpers<AddInventoryItem>) => {
        await onClick(values);
    }

    return (
        <div className='form-input--wrapper'>
            <Formik initialValues={initialValue} 
                onSubmit={submit}>{(props: FormikProps<AddInventoryItem>) => (
                <Form className='form-input'>
                    <div className='top-input--wrapper'>
                        <FormikImagesSelectorComponent name='images' />
                        <div className="side-input--wrapper">
                            <div className='text-input'>
                                <label htmlFor="name">Name</label>
                                <FormikInput fieldName='name' type="text" id="name" required />

                                <label htmlFor="inventory_number_internal">interne Inventarnummer</label>
                                <FormikInput fieldName='inventoryNumberInternal' getValue={(val) => val?.toString() ?? ''} modifier={(e) => { console.error(e); return e.target.valueAsNumber}} type="number" id="inventory_number_internal" />

                                <label htmlFor="inventory_number_external">externe Inventarnummer</label>
                                <FormikInput fieldName='inventoryNumberExternal' getValue={(val) => val?.toString() ?? ''} modifier={(e) => { console.error(e); return e.target.valueAsNumber}} type="number" id="inventory_number_external" />
                                
                                <label htmlFor="storage">Lagerort</label>
                                <FormikSelectionInputWithCustomInput fieldName='storageLocation' /*options={storagePlaces}*/ options={data[0]} onChange={() => props.setFieldValue('storageLocation2', '')} />

                                <div></div>
                                <FormikSelectionInputWithCustomInput fieldName='storageLocation2' /*options={storagePlaces2}*/ options={props.values.storageLocation !== '' ? data[1](props.values.storageLocation) : []} />

                                <label htmlFor="deposit">Kaution</label>
                                <FormikInput fieldName='deposit' after={<div className='currency-placeholder'>€</div>} className='deposit-input' type="number" id="deposit" step={0.01} inputMode='numeric' min={0} required modifier={updateDeposit} getValue={getDeposit} />
                            </div>
                            <Field name='borrowable' type="checkbox" id="available" />
                            <label htmlFor="available">Öffentlich ausleihbar</label>
                        </div>
                    </div>

                    <label htmlFor='description'>Beschreibung</label>
                    <FormikTextarea id='description' rows={6} fieldName='description' />

                    <label htmlFor='defects'>Mängel</label>
                    <FormikTextarea id='defects' rows={6} fieldName='defects' />

                    <FormikFileSelector name='manuals' title='Anleitungen' />

                    <input type="submit" value={label} />
                </Form>
            )}
            </Formik>
        </div>
    );
}
