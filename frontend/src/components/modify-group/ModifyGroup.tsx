import './ModifyGroup.css';
import { Form, Formik, FormikHelpers, FormikProps, useField } from "formik";
import { AddGroupItem } from "../../models/group.model";
import { FormikImagesSelectorComponent } from "../image-selector-with-preview/ImageSelectorWithPreview";
import { FormikInput, FormikTextarea } from "../../core/input/Input";
import { InventoryItem } from '../../models/InventoryItem.model';
import { Button, Card, CardList, Checkbox, Collapse, H3, NonIdealState, Spinner } from '@blueprintjs/core';
import { Suspense, useMemo, useState } from 'react';
import { PreviewPhysicalObject, useFilterPhysicalObjectsByName, useGetPhysicalObjects } from "../../hooks/pysical-object-helpers";
import { MdArrowDropDown, MdArrowRight } from "react-icons/md";
import { useFilterUserOrganizationInfo } from '../../utils/organization-info-utils';
import { OrganizationRights } from '../../models/user.model';
import { SubmitErrorState, SubmitState } from '../../utils/submit-state';

export function ModifyGroup<T>({ initialValue, label, onSubmit, ErrorScreen, onSuccess }: { initialValue: AddGroupItem, label: string, onSubmit: (value: AddGroupItem) => Promise<SubmitState<T>>, onSuccess: () => void, ErrorScreen: React.FC<{ data: T, retry: () => void }>}) {
    const [ submitState, setSubmitState ] = useState<SubmitErrorState<T>>();
    const submit = async (values: AddGroupItem, _: FormikHelpers<AddGroupItem>) => {
        if (!submitState) {
            const initialResult = await onSubmit(values);
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
        <div className='container'>
            <Formik initialValues={initialValue} onSubmit={submit}>
                {(props: FormikProps<AddGroupItem>) => (
                    <>
                    { !props.isSubmitting && submitState && <ErrorScreen data={submitState.data} retry={() => props.submitForm()} /> }
                    { props.isSubmitting && <LoadingScreen /> }
                    { !props.isSubmitting && !submitState && <Form>
                        <div className='inner-container'>
                            <div>
                                <FormikImagesSelectorComponent name='pictures' />
                                <label>Name</label>
                                <FormikInput fieldName='name' />
                                <H3><label htmlFor='description'>Beschreibung</label></H3>
                                <FormikTextarea id='description' rows={6} fieldName='description' />
                                <Button type="submit" fill={true} intent='primary'>{label}</Button>
                            </div>
                            <Suspense>
                                <FormikSelectPhysicalObjects name='physicalObjectIds' orgId={props.values.orgId} />
                            </Suspense>
                        </div>
                    </Form> }
                    </>
                )}
            </Formik>
        </div>
    );
}

function FormikSelectPhysicalObjects({ name, orgId }: { name: string, orgId: string }) {
    const [ props, meta, helper ] = useField<string[]>(name);
    return <SelectPhysicalObjects selection={meta.value} setSelection={helper.setValue} orgId={orgId} />;
}

function SelectPhysicalObjects({ selection, setSelection, orgId }: { orgId: string, selection: string[], setSelection: (val: string[]) => void}) {
    const { data } = useFilterPhysicalObjectsByName([orgId]);
    const items = useMemo(() => {
        return data.map((entry) => { return { ...entry, selected: -1 !== selection.findIndex(id => entry.id === id) } });
    }, [data, selection]);

    const checkedItems = useMemo(() => {
        return items.filter((item) => item.selected)
    }, [items]);

    const uncheckedItems = useMemo(() => {
        return items.filter((item) => !item.selected)
    }, [items]);

    const update = (physicalObject: PreviewPhysicalObject, selected: boolean) => {
        setSelection(
            selected ? [ ...selection, physicalObject.id ] : selection.filter((id) => physicalObject.id !== id)
        );
    }

    return (
        <div className="object-selection--wrapper">
            { checkedItems.length > 0 && <CollapsablePhysicalObjectListWithTitle title="Objekte in dieser Gruppe" items={checkedItems} update={update} /> }
            <CollapsablePhysicalObjectListWithTitle title={checkedItems.length > 0 ? 'Weitere Objekte hinzufügen' : 'Objekte hinzufügen'} items={uncheckedItems} update={update} />
        </div>
    );
}

function CollapsablePhysicalObjectListWithTitle({ title, items, update }: { title: string, items: (PreviewPhysicalObject & { selected: boolean })[], update: (obj: PreviewPhysicalObject, selected: boolean) => void }) {
    const [ isOpen, setIsOpen ] = useState(true);
    
    return (
        <div>
            <Card onClick={() => setIsOpen(!isOpen)} className="physical-object-list--header">
                { isOpen ? <MdArrowDropDown size={24} className="physical-object-list--header-icon" />
                    : <MdArrowRight size={24} className="physical-object-list--header-icon" /> }
                <H3>{title}</H3>
            </Card>
            <Collapse isOpen={isOpen}>
                <CardList>
                    {
                        items.map((physObj) => {
                            return <PhysicalObjectEntry physicalObject={physObj} selected={physObj.selected} onSelect={(val) => update(physObj, val)} key={physObj.id} />
                        })
                    }
                </CardList>
            </Collapse>
        </div>
    );
}

function PhysicalObjectEntry({ physicalObject, selected, onSelect }: { physicalObject: PreviewPhysicalObject, selected: boolean, onSelect: (value: boolean) => void }) {
    return (
        <Card interactive={true} onClick={() => onSelect(!selected)} className='physical-object--entry'>
            <Checkbox checked={selected} onChange={(event) => onSelect(event.target.checked)} />
            {physicalObject.name}
        </Card>
    );
}

function LoadingScreen() {
    return (
        <NonIdealState icon={<Spinner />} />
    );
}