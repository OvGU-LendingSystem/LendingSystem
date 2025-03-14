import './DepositInput.css';
import { Input } from "../Input";

export interface DepositInputProps {
    deposit: number;
    setDeposit: (val: number) => void;
    touched: boolean;
}

export function DepositInput({ deposit, setDeposit, touched }: DepositInputProps) {
    return <Input className='deposit-input' id="deposit"
        after={<div className='currency-placeholder'>€</div>}
        type="number" step={0.01} inputMode='numeric' min={0} touched={touched}
        onChange={(e) => setDeposit(updateDeposit(e))}
        value={getDeposit(deposit)} />;
}

const updateDeposit = (e: React.ChangeEvent<HTMLInputElement>) => {
    return Math.trunc(e.target.valueAsNumber * 100);
}

const getDeposit = (val: number) => {
    return new Intl.NumberFormat(undefined, ({ maximumFractionDigits: 2, useGrouping: false })).format(val / 100);
}