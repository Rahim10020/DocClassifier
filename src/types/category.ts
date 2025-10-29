export interface Category {
    id: string;
    name: string;
    nameEn?: string;
    parentId?: string;
    profiles: string[];
    keywords: string[];
    priority: number;
    icon?: string;
    color?: string;
    children?: Category[];
}

export interface CategoryWithCount extends Category {
    documentCount: number;
}

export interface CategoryTree extends Category {
    children: CategoryTree[];
    level: number;
    expanded?: boolean;
}

export interface Subcategory {
    id: string;
    name: string;
    nameEn?: string;
    keywords: string[];
    parentId: string;
}

export type Profile = 'student' | 'professional' | 'researcher' | 'personal' | 'auto';

export interface ProfileOption {
    id: Profile;
    name: string;
    nameEn: string;
    icon: string;
    description: string;
    descriptionEn: string;
}