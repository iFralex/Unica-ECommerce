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

export type Transform = { Position?: Vector, Rotation?: Vector, Scale?: Vector }