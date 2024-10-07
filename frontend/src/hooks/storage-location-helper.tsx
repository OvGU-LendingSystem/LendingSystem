import { gql } from "@apollo/client";
import { useSuspenseQueryWithResponseMapped } from "./response-helper";

const STORAGE_LOCATION_QUERY = gql`
query StorageLocation {
  filterPhysicalObjects {
    storageLocation,
    storageLocation2
  }
}`;

interface StorageLocationQueryResponse {
    storageLocation: string;
    storageLocation2: string;
};

export function useStorageLocationHelper() {
    const map = (response: StorageLocationQueryResponse[]):
    [ storageLocation: string[], getStorageLocation2: (location: string) => string[]] => {
        const storageLocation2Map = new Map<string, Set<string>>();
        response.forEach((location) => {
            const location2List = storageLocation2Map.get(location.storageLocation) ?? new Set();
            if (location.storageLocation2 && location.storageLocation2.trim().length > 0)
                location2List.add(location.storageLocation2);
            storageLocation2Map.set(location.storageLocation, location2List);
        });
        const storageLocation2Array = new Map<string, string[]>();
        storageLocation2Map.forEach((val, key) => storageLocation2Array.set(key, [...val]))

        return [ [...storageLocation2Map.keys()], (location: string) => storageLocation2Array.get(location) ?? [] ];
    }
    return useSuspenseQueryWithResponseMapped<
        StorageLocationQueryResponse[], [ storageLocation: string[], getStorageLocation2: (location: string) => string[]]
    >(STORAGE_LOCATION_QUERY, 'filterPhysicalObjects', {}, map);
}