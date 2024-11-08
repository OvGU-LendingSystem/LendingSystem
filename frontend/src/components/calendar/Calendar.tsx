import "./Calendar.css";
import { Card, Checkbox, Divider, H4, H6, Overlay2 } from "@blueprintjs/core";
import { addDays, endOfWeek, isAfter, isWeekend, startOfWeek, subDays } from "date-fns";
import { Fragment, useMemo, useState } from "react";
import { DateRange, DayPicker, rangeIncludesDate } from "react-day-picker";
import { MdCalendarMonth, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { Order, useGetOrder } from "../../hooks/order-helper";

function getSelectedWeek(date: Date, includeWeekend: boolean) {
    const subDaysAmount = includeWeekend ? 0 : 2;
    return {
        from: startOfWeek(date, { weekStartsOn: 1 }),
        to: subDays(endOfWeek(date, { weekStartsOn: 1 }), subDaysAmount)
    };
}

function getDaysInRange(range: DateRange) {
    if (!range.from || !range.to) {
        return [];
    }
    
    const days = [];
    let date = range.from;
    while (!isAfter(date, range.to)) {
        days.push(date);
        date = addDays(date, 1);
    }

    return days;
}

export function Calendar() {
    const [ selectedDay, setSelectedDay ] = useState<Date>(new Date());
    const [ showWeekend, setShowWeekend ] = useState(false);
    const selectedWeek = useMemo(() => getSelectedWeek(selectedDay, showWeekend), [selectedDay, showWeekend]);
    const days = useMemo(() => getDaysInRange(selectedWeek), [selectedWeek]);
    
    return (
        <div className="calendar--wrapper">
            <CalendarHeader selectedWeek={selectedWeek} setSelectedDay={setSelectedDay}
                showWeekend={showWeekend} setShowWeekend={setShowWeekend} />
            <div className="day-list--calendar">
                {days.map(day => <CalendarEntry date={day} key={day.getTime()} />)}
            </div>
        </div>
    );
}

interface CalendarHeaderProps {
    selectedWeek: DateRange;
    setSelectedDay: (date: Date) => void;
    showWeekend: boolean;
    setShowWeekend: (value: boolean) => void
}

function CalendarHeader({ selectedWeek, setSelectedDay, showWeekend, setShowWeekend }: CalendarHeaderProps) {
    const formatter = useMemo(() => {
        return new Intl.DateTimeFormat(undefined, { 
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
         })
    }, []); // TODO: language dependency
    const [ showDaypickerDialog, setShowDaypickerDialog ] = useState(false);

    if (!selectedWeek.from || !selectedWeek.to) {
        return <></>;
    }
    const start = selectedWeek.from;
    const end = selectedWeek.to;

    return (
        <Card className="calendar--header">
            <MdChevronLeft size={24} className='week-nav' onClick={() => setSelectedDay(subDays(start, 7))} />
            <span className='week-range-text'>{ formatter.formatRange(start, end) }</span>
            <MdCalendarMonth size={24} className='calendar-btn' onClick={() => setShowDaypickerDialog(true)} />
            <MdChevronRight size={24} className='week-nav' onClick={() => setSelectedDay(addDays(start, 7))} />
            <CalendarDialog isOpen={showDaypickerDialog} close={() => setShowDaypickerDialog(false)}
                selectedWeek={selectedWeek} setSelectedDay={setSelectedDay} showWeekend={showWeekend} />
            <Checkbox checked={showWeekend} onChange={(e) => setShowWeekend(e.target.checked)} className="calendar--weekend-check" label='Wochenende anzeigen' />
        </Card>
    );
}

interface CalendarDialogProps {
    isOpen: boolean;
    close: () => void;
    selectedWeek: DateRange;
    setSelectedDay: (date: Date) => void;
    showWeekend: boolean
}

function CalendarDialog({
    isOpen, close, selectedWeek, setSelectedDay, showWeekend
}: CalendarDialogProps) {
    return (
        <Overlay2 isOpen={isOpen} onClose={close}>
            <Card className="day-picker-overlay--calendar">
                <DayPicker
                    showWeekNumber
                    showOutsideDays
                    weekStartsOn={1}
                    modifiers={{
                        selected: selectedWeek,
                        range_start: selectedWeek?.from,
                        range_end: selectedWeek?.to,
                        range_middle: (date: Date) =>
                            selectedWeek
                              ? rangeIncludesDate(selectedWeek, date, true)
                              : false,
                        disabled: (date) => !showWeekend && isWeekend(date)
                    }}
                    onDayClick={(day, modifiers) => {
                        setSelectedDay(day);
                        close();
                    }} />
            </Card>
        </Overlay2>
    );
}

export function CalendarEntry({ date }: { date: Date }) {
    const formatter = useMemo(() => {
        return new Intl.DateTimeFormat(undefined, { 
            weekday: 'short'
         })
    }, []); // TODO: language dependency

    const { data: outgoingOrders } = useGetOrder();
    const { data: incomingOrders } = useGetOrder();
    const outgoingOrdersSorted = useMemo(() => {
        return [...outgoingOrders].sort((a, b) => a.fromDate.getTime() - b.fromDate.getTime());
    }, [outgoingOrders]);
    const incomingOrdersSorted = useMemo(() => {
        return [...incomingOrders].sort((a, b) => a.tillDate.getTime() - b.tillDate.getTime());
    }, [incomingOrders]);

    return (
        <Card>
            <H4>{ formatter.format(date) }</H4>
            {date.toLocaleDateString()}
            <Divider />
            <H6>Ausleihen</H6>
            {outgoingOrdersSorted.map((order, idx) => 
                <Fragment key={order.orderId}>
                    <OrderItem order={order} />
                    { idx !== outgoingOrdersSorted.length - 1 && <Divider /> }
                </Fragment>
            )}
            <H6>Rückgaben</H6>
            {incomingOrdersSorted.map((order, idx) => 
                <Fragment key={order.orderId}>
                    <OrderItem order={order} />
                    { idx !== incomingOrdersSorted.length - 1 && <Divider /> }
                </Fragment>
            )}
        </Card>
    )
}

export function OrderItem({ order }: { order: Order }) {
    return (
        <>
            <p>Ausleihe von {order.user.firstName} {order.user.lastName}</p>
            <p>Enthält:</p>
            <ul>
                {order.physicalObjects.map((object) => <li key={object.physId}>{object.name}</li>)}
            </ul>
        </>
    );
}