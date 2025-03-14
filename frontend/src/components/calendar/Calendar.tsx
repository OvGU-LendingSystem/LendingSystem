import "./Calendar.css";
import { Button, Card, Checkbox, Classes, Divider, FormGroup, H4, H6, NonIdealState, Overlay2, Popover, Spinner } from "@blueprintjs/core";
import { addDays, endOfWeek, isAfter, isWeekend, startOfWeek, subDays } from "date-fns";
import { Fragment, Suspense, useEffect, useMemo, useState } from "react";
import { DateRange, DayPicker, rangeIncludesDate } from "react-day-picker";
import { MdCalendarMonth, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { Order, useGetOrder } from "../../hooks/order-helper";
import { useUserInfo } from "../../context/LoginStatusContext";
import { useFilterUserOrganizationInfo } from "../../utils/organization-info-utils";
import { OrganizationInfo, OrganizationRights } from "../../models/user.model";
import { useGetOrganizationByIdQuery } from "../../hooks/organization-helper";

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
    
    const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
    const [showUserOrders, setShowUserOrders] = useState<boolean>(true);

    return (
        <div className="calendar--wrapper">
            <Suspense>
                <CalendarHeader selectedWeek={selectedWeek} setSelectedDay={setSelectedDay}
                    showWeekend={showWeekend} setShowWeekend={setShowWeekend}
                    selectedOrgs={selectedOrgs} setSelectedOrgs={setSelectedOrgs}
                    showUserOrders={showUserOrders} setShowUserOrders={setShowUserOrders} />
            </Suspense>
            <div className="day-list--calendar">
                <Suspense fallback={<NonIdealState><Spinner /></NonIdealState>}>
                    {days.map(day => <CalendarEntry date={day} key={day.getTime()} orgs={selectedOrgs} showUserOrders={showUserOrders} />)}
                </Suspense>
            </div>
        </div>
    );
}

interface CalendarHeaderProps {
    selectedWeek: DateRange;
    setSelectedDay: (date: Date) => void;
    showWeekend: boolean;
    setShowWeekend: (value: boolean) => void;

    selectedOrgs: string[];
    setSelectedOrgs: (val: string[]) => void;
    showUserOrders: boolean;
    setShowUserOrders: (val: boolean) => void;
}

function CalendarHeader({
    selectedWeek, setSelectedDay, showWeekend, setShowWeekend,
    selectedOrgs, setSelectedOrgs, showUserOrders, setShowUserOrders
}: CalendarHeaderProps) {
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

            <CalenderFilterOptions showUserOrders={showUserOrders} setShowUserOrders={setShowUserOrders}
                selectedOrgs={selectedOrgs} setSelectedOrgs={setSelectedOrgs} />
        </Card>
    );
}

interface CalenderFilterOptionsProps {
    showUserOrders: boolean;
    setShowUserOrders: (val: boolean) => void;
    selectedOrgs: string[];
    setSelectedOrgs: (val: string[]) => void;
}

function CalenderFilterOptions({
    showUserOrders, setShowUserOrders,
    selectedOrgs, setSelectedOrgs
}: CalenderFilterOptionsProps) {
    const watcherOrgs: OrganizationInfo[] = useFilterUserOrganizationInfo(OrganizationRights.WATCHER);
    useEffect(() => {
        setSelectedOrgs(watcherOrgs.map((org) => org.id));
        if (watcherOrgs.length === 0) {
            setShowUserOrders(true);
        }
    }, [watcherOrgs]);

    return (<>
    { watcherOrgs.length !== 0 &&
        <Popover 
            interactionKind='click'
            popoverClassName={Classes.POPOVER_CONTENT_SIZING}
            placement='bottom'
            content={
                <FormGroup>
                    <Checkbox checked={showUserOrders} label="eigene Bestellungen"
                        onChange={() => setShowUserOrders(!showUserOrders)} />
                    {
                        watcherOrgs.map((watcherOrg) => 
                            <OrganizationCheckbox key={watcherOrg.id} watcherOrg={watcherOrg}
                                selectedOrgs={selectedOrgs} setSelectedOrgs={setSelectedOrgs} />)
                    }
                </FormGroup>
            }
            renderTarget={({ isOpen, ...targetProps}) => (
                <Button {...targetProps} intent='none' text='Filtere Bestellungen' />
            )} />
    }</>);
}

interface OrganizationCheckboxProps {
    watcherOrg: OrganizationInfo;
    selectedOrgs: string[];
    setSelectedOrgs: (val: string[]) => void;
}

function OrganizationCheckbox({ watcherOrg, selectedOrgs, setSelectedOrgs }: OrganizationCheckboxProps) {
    const { data: org } = useGetOrganizationByIdQuery(watcherOrg.id);
    
    const isChecked = selectedOrgs.includes(org.id);
    const onChange = () => {
        if (isChecked) {
            const orgPos = selectedOrgs.findIndex((x) => x === org.id);
            if (orgPos === -1)
                return;

            setSelectedOrgs([...selectedOrgs.slice(0, orgPos), ...selectedOrgs.slice(orgPos + 1)]);
        } else {
            setSelectedOrgs([...selectedOrgs, org.id])
        }
    };

    return <Checkbox checked={isChecked} label={`Bestellungen in ${org.name}`} onChange={onChange} />;
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

interface CalendarEntryProps {
    date: Date;
    orgs: string[];
    showUserOrders: boolean;
}

export function CalendarEntry({ date, orgs, showUserOrders }: CalendarEntryProps) {
    const formatter = useMemo(() => {
        return new Intl.DateTimeFormat(undefined, { 
            weekday: 'short'
         })
    }, []); // TODO: language dependency

    const userInfo = useUserInfo();

    const { data: outgoingOrdersOrganization } = useGetOrder(date, undefined, orgs, undefined);
    const { data: outgoingOrdersUser } = useGetOrder(date, undefined, undefined, [ userInfo.id ]);
    const { data: incomingOrdersOrganization } = useGetOrder(undefined, date, orgs, undefined);
    const { data: incomingOrdersUser } = useGetOrder(undefined, date, undefined, [ userInfo.id ]);
    
    const outgoingOrders = useMemo(() => {
        const orders = [];
        if (orgs.length !== 0) {
            orders.push(...outgoingOrdersOrganization);
        }
        if (showUserOrders) {
            orders.push(...outgoingOrdersUser);
        }
        return orders;
    }, [outgoingOrdersOrganization, outgoingOrdersUser, showUserOrders, orgs.length]);
    const incomingOrders = useMemo(() => {
        const orders = [];
        if (orgs.length !== 0) {
            orders.push(...incomingOrdersOrganization);
        }
        if (showUserOrders) {
            orders.push(...incomingOrdersUser);
        }
        return orders;
    }, [incomingOrdersOrganization, incomingOrdersUser, showUserOrders, orgs.length]);

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
            { outgoingOrdersSorted.length === 0 && <div style={{ color: '#5f6b7c', textAlign: 'center' }}>Keine Ausleihen</div> }

            <H6>Rückgaben</H6>
            {incomingOrdersSorted.map((order, idx) => 
                <Fragment key={order.orderId}>
                    <OrderItem order={order} />
                    { idx !== incomingOrdersSorted.length - 1 && <Divider /> }
                </Fragment>
            )}
            { incomingOrdersSorted.length === 0 && <div style={{ color: '#5f6b7c', textAlign: 'center' }}>Keine Rückgaben</div> }
        </Card>
    )
}

export function OrderItem({ order }: { order: Order }) {
    return (
        <div>
            <p style={{ marginBottom: 0 }}>Ausleihe von {order.user.firstName} {order.user.lastName}</p>
            <p style={{ marginBottom: 0 }}>Enthält:</p>
            <ul style={{ marginTop: 0 }}>
                {order.physicalObjects.map((object) => <li style={{color: getColor(object.orderStatus)}} key={object.physId}>{object.name}</li>)}
            </ul>
        </div>
    );
}

const getColor = (status: string) => {
    switch (status) {
        case 'PENDING':
            return '#777706';
        case 'RESERVED':
            return '#777706';
        case 'ACCEPTED':
            return '#046635';
        case 'PICKED':
            return '#4f7288';
        case 'REJECTED':
            return '#a80202';
        case 'RETURNED':
            return '#9b6503';
        default:
            return 'black';
    }
}