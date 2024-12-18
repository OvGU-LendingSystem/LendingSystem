import './InternalInventory.css';
import { useNavigate, useSearchParams } from "react-router-dom";
import { isApolloError, useSuspenseQuery } from "@apollo/client";
import { Suspense, useMemo, useState } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useDeleteGroupMutation, useGetGroupsQuery } from "../../hooks/group-helpers";
import { Button, Card, CardList, CardListProps, CardProps, Checkbox, Classes, Collapse, ControlGroup, EntityTitle, H2, H3, IconName, InputGroup, Intent, LinkProps, MaybeElement, Menu, MenuItem, NonIdealState, Popover, Spinner } from "@blueprintjs/core";
import { MdBugReport, MdWifiOff } from 'react-icons/md';
import { ActionDialogWithRetryToast } from '../action-dialog/ActionDialog';
import { PreviewPhysicalObject, useFilterPhysicalObjectsByName } from '../../hooks/pysical-object-helpers';
import { useFilterUserOrganizationInfo } from '../../utils/organization-info-utils';
import { OrganizationRights } from '../../models/user.model';
import { useGetOrganizationByIdQuery } from '../../hooks/organization-helper';

type SearchTypeOptions = 'group' | 'object' | 'both' | 'none';
interface InternalInventorySearchParams {
    name: string | null;
    type: SearchTypeOptions;
}

function isSearchTypeOption(val: string): val is SearchTypeOptions {
    return ['group', 'object', 'both', 'none'].includes(val);
}

function hasValue<T>(entry: [string, T | null | undefined]): entry is [string, T] {
    return !!entry[1];
}

export function InternalInventory() {
    const [ searchParams, setSearchParams ] = useSearchParams({ type: 'both' } satisfies Partial<InternalInventorySearchParams>);
    const validSearchParams = useMemo(() => {
        const queryType = searchParams.get('type');
        const validQueryType = queryType !== null && isSearchTypeOption(queryType) ? queryType : 'both';
        const params = {
            name: searchParams.get('name'),
            type: {
                group: validQueryType === 'both' || validQueryType === 'group',
                object: validQueryType === 'both' || validQueryType === 'object'
            }
        };
        return params;
    }, [searchParams]);
    const updateSearchParams = (params: Partial<{ name?: string, type: { object: boolean, group: boolean } }>) => {
        const getType = (value: { object: boolean, group: boolean }) => {
            if (value.object === true && value.group === true)
                return undefined;
            else if (value.object === true && !value.group)
                return 'object';
            else if (!value.object && value.group === true)
                return 'group';
            return 'none';
        }
        const type = getType(params.type ?? validSearchParams.type);
        const newParams = Object.entries({ ...validSearchParams, ...params, type }).filter(entry => hasValue(entry));
        setSearchParams(new URLSearchParams(newParams as [string, string][]));
    };
    const updateSearchText = withDelay(250)((text: string) => {
        updateSearchParams({ name: text.trim().length > 0 ? text : undefined })
    });
    const updateSearchType = ((value: { object?: boolean, group?: boolean }) => {
        updateSearchParams({ type: { ...validSearchParams.type, ...value} });
    });

    const orgs = useFilterUserOrganizationInfo(OrganizationRights.INVENTORY_ADMIN);

    const [ filterOptionsOpen, setFilterOptionsOpen ] = useState(false);

    return (
        <div className='internal-inventory-screen'>
            <ControlGroup className='toolbar' fill={true}>
                <Button outlined={true} className={Classes.FIXED} onClick={() => setFilterOptionsOpen(!filterOptionsOpen)}>Filter</Button>
                <InputGroup type="text" large={true} placeholder='Suchen...' onChange={(e) => updateSearchText(e.target.value)} />
                <Popover content={<AddPopoverList />} placement='bottom-end' className={Classes.FIXED}>
                    <Button large={true} intent='primary' outlined={true} icon='add-to-artifact'>Neu</Button>
                </Popover>
            </ControlGroup>
            <Collapse isOpen={filterOptionsOpen}>
                <Card>
                    <Checkbox checked={validSearchParams.type.object}
                        onChange={(e) => updateSearchType({ object: e.target.checked })}>Objekte</Checkbox>
                    <Checkbox checked={validSearchParams.type.group}
                        onChange={(e) => updateSearchType({ group: e.target.checked })}>Gruppen</Checkbox>
                </Card>
            </Collapse>

            <ErrorBoundary FallbackComponent={ErrorScreen}>
                { orgs.map((org) => <PhysicalObjectAndGroupList orgId={org.id} searchParams={validSearchParams} />) }
            </ErrorBoundary>
        </div>
    );
}

function PhysicalObjectAndGroupList({
    orgId,
    searchParams
}: {
        orgId: string,
        searchParams: { name: string | null, type: { object: boolean, group: boolean } }    
}) {
    const { data: org } = useGetOrganizationByIdQuery(orgId);

    return (
        <>
        <H2>{org.name}</H2>
        { searchParams.type.object &&
            <div className="internal-inventory-list">
                <H3>Objekte</H3>
                <Suspense fallback={<LoadingScreen />}>
                    <InventoryList name={searchParams.name ?? undefined} orgId={orgId} />
                </Suspense>
            </div>
        }
        { searchParams.type.group &&
            <div className="internal-inventory-list">
                <H3>Gruppen</H3>
                <Suspense fallback={<LoadingScreen />}>
                    <GroupList name={searchParams.name ?? undefined} orgId={orgId} />
                </Suspense>
            </div>
        }
        </>
    );
}

function AddPopoverList() {
    const navigate = useNavigate();
    const orgs = useFilterUserOrganizationInfo(OrganizationRights.INVENTORY_ADMIN);

    return (
        <Menu>
            <MenuItem text='Neues Objekt hinzufügen für '>
            {
                orgs.map((orgInfo) => (<AddObjectForOrganizationMenuItem orgId={orgInfo.id} />))
            }
            </MenuItem>
            <MenuItem text='Neue Gruppe hinzufügen' onClick={() => navigate('/inventory/group/add')} />
        </Menu>
    );
}

function AddObjectForOrganizationMenuItem({ orgId }: { orgId: string }) {
    const navigate = useNavigate();
    const { data: org } = useGetOrganizationByIdQuery(orgId);

    return (
        <MenuItem text={org.name} onClick={() => navigate(`/inventory/add/${org.id}`)} />
    );
}

function withDelay(ms: number) {
    let id: number | undefined = undefined;

    const run = (func: Function) => (...args: any[]) => {
        window.clearTimeout(id);
        id = window.setTimeout(func, ms, ...args);    
    }
    return run;
}

const inventoryItemDeleteDialogText = {
    cancelText: 'Abbrechen',
    confirmText: 'Objekt löschen',
    bodyText: 'Dieses Objekt löschen?',
    toasterMessageSuccess: 'Objekt erfolgreich gelöscht',
    toasterMessageError: 'Objekt konnte nicht gelöscht werden',
    toasterMessageRetry: 'Erneut versuchen',
    toasterMessageLoading: 'Objekt wird gelöscht...'
};

function InventoryList({ name, orgId }: { name?: string, orgId: string }) {
    const { data: items } = useFilterPhysicalObjectsByName([orgId], name);
    const [ deleteItem ] = useDeleteGroupMutation();
    const [ deleteId, setDeleteId ] = useState<string>();

    return (
        <>
            <ActionDialogWithRetryToast id={deleteId} setId={setDeleteId} action={() => deleteItem({ variables: { id: deleteId } })}
                icon='trash' {...inventoryItemDeleteDialogText} />
            <BaseInventoryListWithMenu items={items} menu={(id) => <InventoryOptionsOverlay id={id} onDeleteClick={() => setDeleteId(id)} />} />
        </>
    );
}

export interface BaseInventoryListWithMenuProps extends CardListProps {
    items: PreviewPhysicalObject[],
    onItemClick?: (id: string) => void,
    menu: (id: string) => React.JSX.Element
}

export interface BaseInventoryListProps extends CardListProps {
    items: PreviewPhysicalObject[],
    onItemClick?: (id: string) => void,
    after: (id: string) => React.JSX.Element
}

function BaseInventoryListWithMenu({ menu, ...props }: BaseInventoryListWithMenuProps) {
    const after = (id: string) => <InventoryOptions id={id} menu={menu} />

    return (
        <BaseInventoryList {...props} after={after} />
    );
}

export function BaseInventoryList({ items, after, onItemClick, ...props }: BaseInventoryListProps) {
    const onClick = (id: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!onItemClick)
            return;
        onItemClick(id);
        e.preventDefault();
        e.stopPropagation();
    }
    
    const list = items.map(item => {
        return <InventoryListItem key={item.id} item={item} after={after}
            onClick={(e) => onClick(item.id, e)} />
    });

    return (
        <CardList {...props}>{list}</CardList>
    );
}

interface InventoryListItemProps extends CardProps {
    item: PreviewPhysicalObject;
    after: (id: string) => React.JSX.Element;
}

function InventoryListItem({ item, after, ...props }: InventoryListItemProps) {
    return (
        <Card interactive={true} {...props} className='inventory-list-item'>
            <EntityTitle title={item.name} icon={<PreviewImage imageSrc={item.imageSrc} />} subtitle={item.description} ellipsize={true} />
            {after(item.id)}
        </Card>
    );
}

function PreviewImage({ imageSrc }: { imageSrc?: string }) {
    return (
        <>
            { imageSrc
                ? <img src={imageSrc} className='preview-image' />
                : <div className='preview-image' />
            }
        </>
    );
}

function InventoryOptions({ id, menu }: { id: string, menu: (id: string) => React.JSX.Element }) {
    return (
        <Popover content={menu(id)} placement='bottom-end'>
            <Button minimal={true} icon='more' />
        </Popover>
    );
}

function InventoryOptionsOverlay({ id, onDeleteClick }: { id: string, onDeleteClick: () => void }) {
    const navigate = useNavigate();
    return (
        <Menu>
            <MenuItem text='Bearbeiten' onClick={() => navigate(`/inventory/edit/${id}`)} />
            <MenuItem text='View history' />
            <MenuItem text='Löschen' onClick={onDeleteClick} />
        </Menu>
    );
}

const groupDeleteDialogText = {
    cancelText: 'Abbrechen',
    confirmText: 'Gruppe löschen',
    bodyText: 'Diese Gruppe löschen?',
    toasterMessageSuccess: 'Gruppe erfolgreich gelöscht',
    toasterMessageError: 'Gruppe konnte nicht gelöscht werden',
    toasterMessageRetry: 'Erneut versuchen',
    toasterMessageLoading: 'Gruppe wird gelöscht...'
};

const BASE_IMAGE_PATH = process.env.REACT_APP_PICUTRES_BASE_URL;

function GroupList({ name, orgId }: { name?: string, orgId: string }) {
    const { data } = useGetGroupsQuery([orgId], name);
    const [ deleteGroup ] = useDeleteGroupMutation();
    const [ deleteId, setDeleteId ] = useState<string>();

    const formatter = new Intl.ListFormat(undefined, {
        style: 'short',
        type: 'conjunction'
    });

    const items = data.map(item => {
        const path = item.pictures[0]?.path;
        const src = path !== undefined ? BASE_IMAGE_PATH + path : undefined;
        return {
            id: item.groupId,
            name: item.name,
            description: 'Enthält: ' + formatter.format(item.pysicalObjectNames),
            imageSrc: src
        };
    });

    return (
        <>
            <ActionDialogWithRetryToast id={deleteId} setId={setDeleteId} action={() => deleteGroup({ variables: { id: deleteId } })}
                icon='trash' {...groupDeleteDialogText} />
            <BaseInventoryListWithMenu items={items} menu={(id) => <GroupListItemMenu id={id} onDeleteClick={() => setDeleteId(id)} />} />        
        </>
    );
}

function GroupListItemMenu({ id, onDeleteClick }: { id: string, onDeleteClick: () => void }) {
    const navigate = useNavigate();
    return (
        <Menu>
            <MenuItem text='Bearbeiten' onClick={() => navigate(`/inventory/group/edit/${id}`)} />
            <MenuItem text='Löschen' onClick={onDeleteClick} />
        </Menu>
    );
}

function LoadingScreen() {
    return (
        <NonIdealState icon={<Spinner />} />
    );
}

function ErrorScreen({ error, resetErrorBoundary }: FallbackProps) {
    if (!isApolloError(error))
        throw error;
    
    if (error.networkError && error.networkError.name !== 'ServerError' && error.networkError.name !== 'ServerParseError') {
        return (
            <NonIdealState title='Keine Internetverbindung' icon={<MdWifiOff />}
                action={<Button onClick={resetErrorBoundary}>Erneut versuchen</Button>} />
        );
    }

    return (
        <NonIdealState title='Ein interner Fehler ist aufgetreten' icon={<MdBugReport />} />
    );
}