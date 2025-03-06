import { ImageResource, RemoteImage } from "./file.model";
import { InventoryItem } from "./InventoryItem.model";

export interface Group {
    groupId: string;
    name: string;
    pictures: RemoteImage[];
    physicalObjects: InventoryItem[];
}

export interface AddGroupItem {
    name: string;
    description: string;
    pictures: ImageResource[];
    physicalObjectIds: string[];
    orgId: string;
}