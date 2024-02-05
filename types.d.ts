export type Dancer = {
    age: number;
    dancers_names: string | null;
    discipline: string;
    group: string;
    level: string;
    name: string;
    perf_comp: string;
    studio: string;
}

export type SortByCategory = {
    discipline: string;
    dancers: Dancer[];
};

export type SortBySize = {
    discipline: string;
    solo: Dancer[];
    duet: Dancer[];
    small: Dancer[];
    medium: Dancer[];
    large: Dancer[];
};

export type SizeSort = {
    solo: Dancer[];
    duet: Dancer[];
    small: Dancer[];
    medium: Dancer[];
    large: Dancer[];
    unplaceable: Dancer[];
}


export type RoughGroup = {
    duplicate: boolean | null;
    category: string;
    size: string;
    level: string[];
    dancers: Dancer[];
    time: number;
}
