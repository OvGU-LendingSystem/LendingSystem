import './ModifyGroup.css';
import { Form, Formik, FormikHelpers, FormikProps, useField } from "formik";
import { AddGroupItem } from "../../models/group.model";
import { FormikImagesSelectorComponent } from "../image-selector-with-preview/ImageSelectorWithPreview";
import { FormikInput } from "../../core/input/Input";
import { InventoryItem } from '../../models/InventoryItem.model';
import { Button, Card, CardList, Checkbox, Collapse, H3 } from '@blueprintjs/core';
import { Suspense, useMemo, useState } from 'react';
import { useGetPhysicalObjects } from "../../hooks/pysical-object-helpers";
import { MdArrowDropDown, MdArrowRight } from "react-icons/md";

export function ModifyGroup({ initialValue, onSubmit }: { initialValue: AddGroupItem, onSubmit: (value: AddGroupItem) => Promise<void> }) {
    const submit = async (values: AddGroupItem, _: FormikHelpers<AddGroupItem>) => {
        await onSubmit(values);
    }

    return (
        <div className='container'>
            <Formik initialValues={initialValue} onSubmit={submit}>
                {(props: FormikProps<AddGroupItem>) => (
                    <Form>
                        <div className='inner-container'>
                            <div>
                                <FormikImagesSelectorComponent name='pictures' />
                                <label>Name</label>
                                <FormikInput fieldName='name' />
                                <Button type="submit" fill={true} intent='primary'>Add group</Button>
                            </div>
                            <Suspense>
                                <FormikSelectPhysicalObjects name='physicalObjectIds' />
                            </Suspense>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

function FormikSelectPhysicalObjects({ name }: { name: string }) {
    const [ props, meta, helper ] = useField<string[]>(name);
    return <SelectPhysicalObjects selection={meta.value} setSelection={helper.setValue} />;
}

function SelectPhysicalObjects({ selection, setSelection }: { selection: string[], setSelection: (val: string[]) => void}) {
    const { data } = useGetPhysicalObjects();
    const items = useMemo(() => {
        return data.map((entry) => { return { ...entry, selected: -1 !== selection.findIndex(id => entry.physId === id) } });
    }, [data, selection]);

    const checkedItems = useMemo(() => {
        return items.filter((item) => item.selected)
    }, [items]);

    const uncheckedItems = useMemo(() => {
        return items.filter((item) => !item.selected)
    }, [items]);

    const update = (physicalObject: InventoryItem, selected: boolean) => {
        setSelection(
            selected ? [ ...selection, physicalObject.physId ] : selection.filter((id) => physicalObject.physId !== id)
        );
    }

    return (
        <div className="object-selection--wrapper">
            { checkedItems.length > 0 && <CollapsablePhysicalObjectListWithTitle title="Objekte in dieser Gruppe" items={checkedItems} update={update} /> }
            <CollapsablePhysicalObjectListWithTitle title={checkedItems.length > 0 ? 'Weitere Objekte hinzufügen' : 'Objekte hinzufügen'} items={uncheckedItems} update={update} />
        </div>
    );
}

function CollapsablePhysicalObjectListWithTitle({ title, items, update }: { title: string, items: (InventoryItem & { selected: boolean })[], update: (obj: InventoryItem, selected: boolean) => void }) {
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
                            return <PhysicalObjectEntry physicalObject={physObj} selected={physObj.selected} onSelect={(val) => update(physObj, val)} key={physObj.physId} />
                        })
                    }
                </CardList>
            </Collapse>
        </div>
    );
}

function PhysicalObjectEntry({ physicalObject, selected, onSelect }: { physicalObject: InventoryItem, selected: boolean, onSelect: (value: boolean) => void }) {
    return (
        <Card interactive={true} onClick={() => onSelect(!selected)} className='physical-object--entry'>
            <Checkbox checked={selected} onChange={(event) => onSelect(event.target.checked)} />
            {physicalObject.name}
        </Card>
    );
}