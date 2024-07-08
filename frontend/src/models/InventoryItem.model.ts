export interface InventoryItem {
    id: number;
    name: string;
    inventoryNumberInternal?: number;
    inventoryNumberExternal?: number;
    deposit?: number;
    storageLocation: string;
    defects: string;
    description: string;
}

export type ImageResource = {
    type: 'local',
    file: File
} | {
    type: 'remote',
    path: string
}

//export type AddInventoryItem = Omit<InventoryItem, 'id'>
export interface AddInventoryItem {
    name: string;
    inventoryNumberInternal: string;
    inventoryNumberExternal: string;
    deposit?: number;
    storageLocation: string;
    defects: string;
    description: string;
    available: boolean;
    images: ImageResource[];
}