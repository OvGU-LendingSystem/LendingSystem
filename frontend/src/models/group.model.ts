import { ImageResource, InventoryItem, RemoteImage } from "./InventoryItem.model";

export interface Group {
    groupId: string;
    name: string;
    pictures: RemoteImage[];
    physicalObjects: InventoryItem[];
}

export interface AddGroupItem {
    name: string;
    pictures: ImageResource[];
    physicalObjectIds: string[];
}