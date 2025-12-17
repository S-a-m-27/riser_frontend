export type IconName =
    | 'Flashlight'
    | 'Battery'
    | 'Heart'
    | 'FileText'
    | 'Droplets'
    | 'Radio'
    | 'MapPin'
    | 'Phone'
    | 'Home'
    | 'Shield'
    | 'Package'
    | 'AlertCircle';

export interface ChecklistItem {
    id: number;
    label: string;
    iconName: IconName;
    correctZone: 'kit' | 'home';
}

export const checklistItems: ChecklistItem[] = [
    {
        id: 1,
        label: 'Flashlight',
        iconName: 'Flashlight',
        correctZone: 'kit',
    },
    {
        id: 2,
        label: 'Batteries',
        iconName: 'Battery',
        correctZone: 'kit',
    },
    {
        id: 3,
        label: 'First Aid Kit',
        iconName: 'Heart',
        correctZone: 'kit',
    },
    {
        id: 4,
        label: 'Important Documents',
        iconName: 'FileText',
        correctZone: 'kit',
    },
    {
        id: 5,
        label: 'Water Bottles',
        iconName: 'Droplets',
        correctZone: 'kit',
    },
    {
        id: 6,
        label: 'Radio',
        iconName: 'Radio',
        correctZone: 'kit',
    },
    {
        id: 7,
        label: 'Emergency Contacts',
        iconName: 'Phone',
        correctZone: 'kit',
    },
    {
        id: 8,
        label: 'Non-perishable Food',
        iconName: 'Package',
        correctZone: 'kit',
    },
    {
        id: 9,
        label: 'Secure Windows',
        iconName: 'Home',
        correctZone: 'home',
    },
    {
        id: 10,
        label: 'Move Items Upstairs',
        iconName: 'MapPin',
        correctZone: 'home',
    },
    {
        id: 11,
        label: 'Check Insurance',
        iconName: 'Shield',
        correctZone: 'home',
    },
    {
        id: 12,
        label: 'Emergency Plan',
        iconName: 'AlertCircle',
        correctZone: 'home',
    },
];

