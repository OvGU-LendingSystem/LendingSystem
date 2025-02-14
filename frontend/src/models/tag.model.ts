export interface NewTag {
    tag: string;
}

export interface RemoteTag {
    id: string;
    tag: string;
}

export type Tag = NewTag | RemoteTag;