
export interface Pages {
    new: undefined
    pools: undefined
    findPool: undefined
    details: {
        id: string
    }
}

export declare global {
    namespace ReactNavigation {
        interface RootParamList extends Pages {
        }
    }
}
