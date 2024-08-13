import { useNavigate } from "react-router-dom";
import Button from "../../core/input/Buttons/Button";
import { gql, useSuspenseQuery } from "@apollo/client";
import { Suspense } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

const GET_INVENTORY = gql`
    query GetInventory {
        filterPhysicalObjects {
            physId,
            name
        }
    }
`;

export function InternalInventory() {
    const navigate = useNavigate();

    return (
        <>
            <Button onClick={() => navigate('/inventory/add')} label='Add item' />

            <ErrorBoundary FallbackComponent={ErrorScreen}>
                <Suspense fallback={<LoadingScreen />}>
                    <InventoryList />
                </Suspense>
            </ErrorBoundary>
        </>
    );
}

interface InventoryListQueryResult {
    filterPhysicalObjects: { physId: string, name: string }[]
}

function InventoryList() {
    const { data } = useSuspenseQuery<InventoryListQueryResult>(GET_INVENTORY);

    const list = data.filterPhysicalObjects.map(item => {
        return <InventoryListItem key={item.physId} item={item} />
    });

    return (
        <>{list}</>
    );
}

function InventoryListItem({ item }: { item: { name: string, physId: string }}) {
    const navigate = useNavigate();
    return (
        <>
            { item.name }
            <Button onClick={() => navigate(`/inventory/edit/${item.physId}`)} label='Edit' />
        </>
    );
}

function LoadingScreen() {
    return (
        <>Loading...</>
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