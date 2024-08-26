export interface SubmitSuccessState {
    type: 'success'
};

export interface SubmitErrorState<T> {
    type: 'error',
    data: T,
    retry?: (prev: T) => Promise<SubmitState<T>>
};

export type SubmitState<T> = SubmitSuccessState | SubmitErrorState<T>;

// --------------------------------------------------------------------------------

export namespace SubmitState {
    export const SUCCESS: SubmitSuccessState = { type: 'success' };

    export class Error<T> implements SubmitErrorState<T> {
        public type: 'error' = 'error';
        public data: T;
        public retry?: (prev: T) => Promise<SubmitState<T>>;

        constructor(data: T, retry?: ((prev: T) => Promise<SubmitState<T>>)) {
            this.data = data;
            this.retry = retry;
        }
    }
}