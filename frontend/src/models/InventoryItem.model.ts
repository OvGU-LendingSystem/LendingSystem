export interface InventoryItem {
    id: number;
    name: string;
    inventoryNumberInternal?: number;
    inventoryNumberExternal?: number;
    borrowable: boolean;
    deposit?: number;
    storageLocation: string;
    defects: string;
    description: string;
}

export interface LocalImage {
    type: 'local',
    file: File
}

export interface RemoteImage {
    type: 'remote',
    path: string,
    fileId: string
}

export type ImageResource = LocalImage | RemoteImage;

//export type AddInventoryItem = Omit<InventoryItem, 'id'>
export interface AddInventoryItem {
    name: string;
    inventoryNumberInternal?: number;
    inventoryNumberExternal?: number;
    borrowable: boolean;
    deposit?: number;
    storageLocation: string;
    defects: string;
    description: string;
    images: ImageResource[];
}