import { User } from "./user.model";

export namespace LoginStatus {

    export interface LoggedIn {
        loggedIn: true,
        user: User
    }

    export interface LoggedOut {
        loggedIn: false
    }

    export type Status = LoggedIn | LoggedOut;

}