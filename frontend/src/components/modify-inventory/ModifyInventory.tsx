import '../../styles/style.css';
import './ModifyInventory.css';
import { FormikHelpers, Formik, FormikProps, Field, Form, useField } from "formik";
import { FormikInput, FormikSelectionInputWithCustomInput, FormikTextarea } from "../../core/input/Input";
import { AddInventoryItem } from "../../models/InventoryItem.model";
import { FormikImagesSelectorComponent } from "../image-selector-with-preview/ImageSelectorWithPreview";
import { FormikFileSelector } from '../file-selector/FileSelector';
import { useStorageLocationHelper } from '../../hooks/storage-location-helper';
import { Suspense, useCallback, useState } from 'react';
import { Button, H3, MenuItem, NonIdealState, Spinner } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, MultiSelect } from '@blueprintjs/select';
import { SubmitErrorState, SubmitSuccessState, SubmitState } from '../../utils/submit-state';
import { Tag } from '../../models/tag.model';
import { useGetTagsQuery } from '../../hooks/tag-helpers';

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
            <Formik initialValues={initialValue} validate={validate}
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
                                <FormikSelectionInputWithCustomInput fieldName='storageLocation' options={data[0]} onChange={() => props.setFieldValue('storageLocation2', '')} />

                                <div></div>
                                <FormikSelectionInputWithCustomInput fieldName='storageLocation2' options={props.values.storageLocation !== '' ? data[1](props.values.storageLocation) : []} />

                                <label htmlFor="deposit">Kaution</label>
                                <FormikInput fieldName='deposit' after={<div className='currency-placeholder'>€</div>} className='deposit-input' type="number" id="deposit" step={0.01} inputMode='numeric' min={0} required modifier={updateDeposit} getValue={getDeposit} />
                            </div>
                            <Field name='borrowable' type="checkbox" id="available" />
                            <label htmlFor="available">Öffentlich ausleihbar</label>
                        </div>
                    </div>

                    <H3><label htmlFor='tags'>Tags</label></H3>
                    <FormikTagInput fieldName='tags' />

                    <H3><label htmlFor='description'>Beschreibung</label></H3>
                    <FormikTextarea id='description' rows={6} fieldName='description' />

                    <H3><label htmlFor='defects'>Mängel</label></H3>
                    <FormikTextarea id='defects' rows={6} fieldName='defects' />

                    <FormikFileSelector name='manuals' title='Anleitungen' />

                    <Button intent='primary' onClick={async () => props.submitForm()}>{label}</Button>
                </Form>
                }
                </>
            )}
            </Formik>
        </div>
    );
}

const filterTags: ItemPredicate<Tag> = (query, tag, idx, exactMatch) => {
    const lowerQuery = query.trim().toLowerCase();
    const lowerTag = tag.tag.trim().toLowerCase();
    if (exactMatch) {
        return lowerQuery === lowerTag;
    }

    return lowerTag.includes(lowerQuery);
}

function FormikTagInput({ fieldName }: { fieldName: string }) {
    const [ field, meta, helper ] = useField<Tag[]>(fieldName);
    const tagsQuery = useGetTagsQuery();

    const areTagsEqual = useCallback((tagA: Tag, tagB: Tag) => {
        if (Object.hasOwn(tagA, 'id') !== Object.hasOwn(tagB, 'id')) return false;
        if (Object.hasOwn(tagA,'id') && Object.hasOwn(tagB, 'id')) return (tagA as any).id === (tagB as any).id;
        return tagA.tag === tagB.tag;
    }, []);

    const tagIsSelected = useCallback((tag: Tag) => {
        return field.value.findIndex((val) => areTagsEqual(val, tag)) !== -1;
    }, [areTagsEqual, field, field.value]);

    const removeTag = useCallback((idx: number) => {
        helper.setValue([...field.value.slice(0, idx), ...field.value.slice(idx + 1, undefined)]);
    }, [helper, field, field.value]);

    const tagRenderer: ItemRenderer<Tag> = (tag, props) => {
        if (!props.modifiers.matchesPredicate) {
            return null;
        }

        return (
            <MenuItem roleStructure='listoption' selected={tagIsSelected(tag)}
                shouldDismissPopover={false} text={tag.tag}
                active={props.modifiers.active} disabled={props.modifiers.disabled}
                key={tag.tag} onClick={props.handleClick} onFocus={props.handleFocus}
                ref={props.ref} />
        );
    }
    
    return <MultiSelect<Tag> selectedItems={field.value} items={tagsQuery.data}
        onItemSelect={(selectedTag, e) => {
            if (tagIsSelected(selectedTag)) {
                const tagIdx = field.value.findIndex((val) => areTagsEqual(val, selectedTag));
                removeTag(tagIdx);
            } else {
                helper.setValue([...field.value, selectedTag]);
            }
            e?.stopPropagation();
            e?.preventDefault();
        }}
        onItemsPaste={(tags) => {
            helper.setValue([...field.value, ...tags]);
        }}
        onClear={() => helper.setValue([])}
        createNewItemFromQuery={(query) => ({ tag: query })}
        createNewItemRenderer={(query, active, click) => <MenuItem icon='add'
            text={`neuen Tag "${query}" erstellen`} active={active}
            onClick={click} shouldDismissPopover={false} />
        }
        createNewItemPosition='first'
        itemsEqual={areTagsEqual}
        itemPredicate={filterTags}
        tagRenderer={(tag) => tag.tag}
        itemRenderer={tagRenderer}
        tagInputProps={{
            onRemove: (node, idx) => removeTag(idx),
            tagProps: { minimal: true }
        }}
        resetOnSelect
        placeholder='Auswählen...' />
}

const validate = (values: AddInventoryItem) => {
    const errors: any = {};

    if (!values.name || values.name.trim() === '') {
        errors.name = 'Name darf nicht leer sein!';
    }
    if (!values.inventoryNumberInternal) {
        errors.inventoryNumberInternal = 'Interne Inventarnummer erforderlich!';
    }
    if (!values.inventoryNumberExternal) {
        errors.inventoryNumberExternal = 'Externe Inventarnummer erforderlich!';
    }

    return errors;
}

function LoadingScreen() {
    return (
        <NonIdealState icon={<Spinner />} />
    );
}