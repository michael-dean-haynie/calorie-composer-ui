
// metadata to be used in template/component
export interface NavData {
    navId: string;
    params?: any;
    label: string;
    destination: string;
    iconName?: string;
    badgeText?: string;
    nestedLevel?: number
}