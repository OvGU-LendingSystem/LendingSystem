import { useField } from 'formik';
import './Input.css';
import { useEffect, useLayoutEffect, useState } from 'react';

export function Input({ before, after, touched, ...inputProps }: InputProps) {
    return (
        <span className={`input--wrapper ${ touched ? 'touched' : 'untouched' }`}>
            <span>{ before }</span>
            <input {...inputProps} />
            <span>{ after }</span>
        </span>
    );
}

export function FormikInput<T extends string | number>({ fieldName, modifier, getValue, ...props }: FormikInputProps<T>) {
    const [ field, meta, helper ] = useField<T>(fieldName);
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (modifier) {
            const value = modifier(e);
            helper.setValue(value);
            e.preventDefault();
            return;
        }
        field.onChange(e);
    }
    const getter = getValue ? getValue(field.value) : field.value;

    return (<Input touched={meta.touched} {...props} {...field} onChange={onChange} value={getter} />);
}

export interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    before?: JSX.Element;
    after?: JSX.Element;
    touched: boolean;
}

export interface FormikInputProps<T> extends Omit<InputProps, 'touched'> {
    fieldName: string;
    modifier?: (e: React.ChangeEvent<HTMLInputElement>) => T;
    getValue?: (val: T) => string;
}

export function SelectionInputWithCustomInput({ options, value, setValue, initialSelected, ...props }: { options: string[], value: string, setValue: (val: string) => void, initialSelected?: number }) {
    const [ showCustomInput, setShowCustomInput ] = useState(true);
    useLayoutEffect(() => {
        if (initialSelected !== undefined && initialSelected < options.length) {
            setValue(options[initialSelected]);
            setShowCustomInput(false);
        }
    }, []);

    const onStorageSelected = (e: any) => {
        const show = e.target.value === '';
        setShowCustomInput(show);
        setValue(e.target.value);
    }

    return (
        <span className='custom-select--wrapper'>
            <select value={showCustomInput ? '' : value} onChange={onStorageSelected}>
                {options.map(name =>
                    <option key={name} value={name}>{name}</option>
                )}
                <option value=''>Custom</option>
            </select>
            { showCustomInput && <Input touched={true} id='storage' type='text' value={value} onChange={(e) => setValue(e.target.value)} /> }
        </span>
    );
}

export function FormikSelectionInputWithCustomInput({ options, fieldName, ...props }: { options: string[], fieldName: string }) {
    const [ field, meta, helper ] = useField(fieldName);
    return (<SelectionInputWithCustomInput options={options} value={field.value} setValue={helper.setValue} initialSelected={0} />);
}

export interface FormikTextareaProps extends React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> {
    fieldName: string;
}

export function FormikTextarea({ fieldName, ...props }: FormikTextareaProps) {
    const [ field, meta, helper ] = useField<string>(fieldName);
    return <textarea {...props} {...field} />
}