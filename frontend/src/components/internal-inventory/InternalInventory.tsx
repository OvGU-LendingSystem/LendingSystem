import './InternalInventory.css';
import { useNavigate, useSearchParams } from "react-router-dom";
import { gql, useSuspenseQuery } from "@apollo/client";
import { Suspense, useMemo, useState } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { PreviewGroup, useGetGroupsQuery } from "../../hooks/group-helpers";
import { Button, ButtonGroup, Card, CardList, Checkbox, Classes, Collapse, ControlGroup, EntityTitle, H3, InputGroup, Menu, MenuItem, NonIdealState, Popover, Spinner, Text } from "@blueprintjs/core";

const GET_INVENTORY = gql`
    query GetInventory($name: String) {
        filterPhysicalObjects(name: $name) {
            physId,
            name,
            description,
            pictures {
                edges {
                    node {
                        path
                    }
                }
            }
        }
    }
`;

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
                { validSearchParams.type.object &&
                    <div className="internal-inventory-list">
                        <H3>Objekte</H3>
                        <Suspense fallback={<LoadingScreen />}>
                            <InventoryList name={validSearchParams.name ?? undefined} />
                        </Suspense>
                    </div>
                }
                
                { validSearchParams.type.group &&
                    <div className="internal-inventory-list">
                        <H3>Gruppen</H3>
                        <Suspense fallback={<LoadingScreen />}>
                            <GroupList name={validSearchParams.name ?? undefined} />
                        </Suspense>
                    </div>
                }
            </ErrorBoundary>
        </div>
    );
}

function AddPopoverList() {
    const navigate = useNavigate();
    return (
        <Menu>
            <MenuItem text='Neues Objekt hinzufügen' onClick={() => navigate('/inventory/add')} />
            <MenuItem text='Neue Gruppe hinzufügen' onClick={() => navigate('/inventory/group/add')} />
        </Menu>
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

interface InventoryListQueryResult {
    filterPhysicalObjects: { physId: string, name: string, description: string
        pictures: {
            edges: {
                node: {
                    path: string
                }
            }[]
        }
     }[]
}

const BASE_IMAGE_PATH = process.env.REACT_APP_PICUTRES_BASE_URL;

function InventoryList({ name }: { name?: string }) {
    const { data } = useSuspenseQuery<InventoryListQueryResult>(GET_INVENTORY, {
        variables: {
            name: name
        }
    });

    const items = data.filterPhysicalObjects.map(item => {
        const path = item.pictures.edges[0]?.node?.path;
        const imageSrc = path !== undefined ? BASE_IMAGE_PATH + path : undefined;
        const it = { ...item, id: item.physId, imageSrc }
        return it;
    });

    return (
        <BaseInventoryList items={items} menu={(id) => <InventoryOptionsOverlay id={id} />} />
    );
}

function BaseInventoryList({ items, menu }: { items: { name: string, id: string, description: string, imageSrc?: string }[], menu: (id: string) => React.JSX.Element }) {
    const list = items.map(item => {
        return <InventoryListItem key={item.id} item={item} menu={menu} />
    });

    return (
        <CardList>{list}</CardList>
    );
}

function InventoryListItem({ item, menu }: { item: { name: string, id: string, description: string, imageSrc?: string }, menu: (id: string) => React.JSX.Element }) {
    return (
        <Card interactive={true} className='inventory-list-item'>
            <EntityTitle title={item.name} icon={<PreviewImage imageSrc={item.imageSrc} />} subtitle={item.description} ellipsize={true} />
            <InventoryOptions id={item.id} menu={menu} />
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

function InventoryOptionsOverlay({ id }: { id: string }) {
    const navigate = useNavigate();
    return (
        <Menu>
            <MenuItem text='Edit' onClick={() => navigate(`/inventory/edit/${id}`)} />
            <MenuItem text='View history' />
        </Menu>
    );
}

function GroupList({ name }: { name?: string }) {
    const { data } = useGetGroupsQuery();
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
        <BaseInventoryList items={items} menu={(id) => <GroupListItemMenu id={id} />} />
    );
}

function GroupListItemMenu({ id }: { id: string }) {
    const navigate = useNavigate();
    return (
        <Menu>
            <MenuItem text='Edit' onClick={() => navigate(`/inventory/group/edit/${id}`)} />
        </Menu>
    );
}

function LoadingScreen() {
    return (
        <NonIdealState icon={<Spinner />} />
    );
}

function ErrorScreen({ error, resetErrorBoundary }: FallbackProps) {
    const errorText = error.networkError ? 'Network' : 'Other';
    console.error(JSON.stringify(error));

    const apolloError = error.name === 'ApolloError';
    const graphQLError = error.graphQLErrors;
    //protocolErrors, clientErrors, networkError
    //TODO

    return (
        <>
            Something went wrong!
            {errorText}
        </>
    );
}