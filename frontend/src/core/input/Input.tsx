import './Input.css';

export function Input({before, after, props }: Partial<{ before: JSX.Element | null, after: JSX.Element | null, props: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> }>) {
    return (
        <span className="input--wrapper">
            <span>{ before }</span>
            <input {...props} />
            <span>{ after }</span>
        </span>
    );
}