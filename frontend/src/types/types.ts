type SafeRequest<T> = {
    error?: Error;
    request?: T;
};

export type CategoryInfo = {
    sku: string
    name: string
    description: string
}

export type Vector = [number, number, number]