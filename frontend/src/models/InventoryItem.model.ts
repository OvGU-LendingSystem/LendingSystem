import { FileResource, ImageResource, RemoteImage } from "./file.model";
import { Tag } from "./tag.model";

export interface InventoryItem {
    physId: string;
    name: string;
    inventoryNumberInternal?: number;
    inventoryNumberExternal?: number;
    borrowable: boolean;
    deposit: number;
    storageLocation: string;
    defects: string;
    description: string;
    images: RemoteImage[];
    category: string;
    organizationId: string;
    organization: string;
    physicalObjects?: InventoryItem[];
    lendingComment?: string;
    returnComment?: string;
    manualPath?: string;
}

export interface InventoryItemInCart {
    physId: string;
    name: string;
    inventoryNumberInternal?: number;
    inventoryNumberExternal?: number;
    borrowable: boolean;
    deposit: number;
    storageLocation: string;
    defects: string;
    description: string;
    images: RemoteImage[];
    category: string;
    organizationId: string;
    organization: string;
    physicalObjects?: InventoryItem[];
    startDate: Date;
    endDate: Date;
    amount: number;
}

//export type AddInventoryItem = Omit<InventoryItem, 'id'>
export interface AddInventoryItem {
    name: string;
    inventoryNumberInternal?: number;
    inventoryNumberExternal?: number;
    borrowable: boolean;
    deposit: number;
    storageLocation: string;
    storageLocation2: string;
    defects: string;
    description: string;
    images: ImageResource[];
    manuals: FileResource[];
    tags: Tag[];
    organizationId: string;
}