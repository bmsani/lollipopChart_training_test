import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.extensibility.ISelectionId;
export interface VData {
    items: VDataItem[];
    minValue: number;
    maxValue: number;
    target: number;
    formatString: string;
}
export interface VDataItem {
    category: string;
    value: number;
    color: string;
    selectionId: ISelectionId;
    highlighted: boolean;
}
