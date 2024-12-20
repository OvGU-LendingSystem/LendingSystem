import '../../styles/style.css';
import './ModifyInventory.css';
import { FormikHelpers, Formik, FormikProps, Field, Form } from "formik";
import { FormikInput, FormikSelectionInputWithCustomInput, FormikTextarea } from "../../core/input/Input";
import { AddInventoryItem } from "../../models/InventoryItem.model";
import { FormikImagesSelectorComponent } from "../image-selector-with-preview/ImageSelectorWithPreview";
import { FormikFileSelector } from '../file-selector/FileSelector';
import { useStorageLocationHelper } from '../../hooks/storage-location-helper';
import { Suspense, useState } from 'react';
import { Button, H3, NonIdealState, Spinner } from '@blueprintjs/core';
import { SubmitErrorState, SubmitSuccessState, SubmitState } from '../../utils/submit-state';

/**
 * Props for {@link ModifyInventoryScreen}
 */
export interface ModifyInventoryProps<T> {
    /**
     * initial values for the inventory item to be displayed
     * @see {@link AddInventoryItem}
     */
    initialValue: AddInventoryItem,
    /**
     * text that is displayed on the submit button for saving
     * the changes
     */
    label: string,
    /**
     * This function is called when the user is finished editing
     * the initial provided values and submits the changes.
     * @see {@link AddInventoryItem}
     * @param values new item data that is edited by the user
     * @returns Contains the result status of the action:
     * - {@link SubmitSuccessState} if the action was successful and onSuccess should be called
     * - {@link SubmitErrorState} if the action failed, {@link ErrorScreen} should be shown and optionally the action
     * should be retried via {@link ErrorScreen}
     */
    onClick: (values: AddInventoryItem) => Promise<SubmitState<T>>,
    /**
     * Displayed when the action performed by {@link onClick} failed.
     * Information about the error can be passed via data.
     */
    ErrorScreen: React.FC<{ data: T, retry: () => void }>,
    /**
     * Function that is called when initial onClick call or a retry was
     * successful. Can be used to display a success message or navigate
     * to an other screen.
     */
    onSuccess: () => void
}

/**
 * Renders a form to modify initial provided values for an inventory item
 * provided via @see {@link ModifyInventoryProps}.
 * Handles displaying loading and error states.
 * @see {@link ModifyInventoryProps}
 * @param props Properties for Modify Inventory Screen
 */
export function ModifyInventory<T>(props: ModifyInventoryProps<T>) {
    return (
        <Suspense>
            <ModifyInventoryScreen {...props} />
        </Suspense>
    );
}

export function ModifyInventoryScreen<T>({ initialValue, label, onClick, ErrorScreen, onSuccess }: ModifyInventoryProps<T>) {
    const { data } = useStorageLocationHelper();
    const [ submitState, setSubmitState ] = useState<SubmitErrorState<T>>();

    const updateDeposit = (e: React.ChangeEvent<HTMLInputElement>) => {
        return Math.trunc(e.target.valueAsNumber * 100);
    }

    const getDeposit = (val: number) => {
        return new Intl.NumberFormat(undefined, ({ maximumFractionDigits: 2, useGrouping: false })).format(val / 100);
    }

    const submit = async (values: AddInventoryItem, helpers: FormikHelpers<AddInventoryItem>) => {
        if (!submitState) {
            const initialResult = await onClick(values);
            if (initialResult.type === 'success') {
                onSuccess();
                return;
            }

            setSubmitState(initialResult);
            return;
        }
        
        if (!submitState.retry)
            return;

        const result = await submitState.retry(submitState.data);
        if (result.type === 'success')
            onSuccess()
        setSubmitState(result.type === 'error' ? result : undefined);
    }

    return (
        <div className='form-input--wrapper'>
            <Formik initialValues={initialValue} 
                onSubmit={submit}>{(props: FormikProps<AddInventoryItem>) => (
                <>
                { !props.isSubmitting && submitState && <ErrorScreen data={submitState.data} retry={() => props.submitForm()} /> }
                { props.isSubmitting && <LoadingScreen /> }
                { !props.isSubmitting && !submitState && <Form className='form-input'>
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

                    <H3><label htmlFor='description'>Beschreibung</label></H3>
                    <FormikTextarea id='description' rows={6} fieldName='description' />

                    <H3><label htmlFor='defects'>Mängel</label></H3>
                    <FormikTextarea id='defects' rows={6} fieldName='defects' />

                    <FormikFileSelector name='manuals' title='Anleitungen' />

                    <Button type="submit" intent='primary'>{label}</Button>
                </Form>
                }
                </>
            )}
            </Formik>
        </div>
    );
}


function LoadingScreen() {
    return (
        <NonIdealState icon={<Spinner />} />
    );
}