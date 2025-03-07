export class NotLoggedInError extends Error {
    name: string = 'Not logged in';
    message: string = 'The user is not logged in!';
}