import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
export declare class Visual implements IVisual {
    private target;
    private svg;
    private scaleX;
    private dim;
    private scaleY;
    private formattingSettings;
    private formattingSettingsService;
    private data;
    constructor(options: VisualConstructorOptions);
    update(options: VisualUpdateOptions): void;
    private drawTarget;
    private drawTargetLabel;
    private drawDataPoints;
    private drawConnectors;
    private drawCategoryLabels;
    private formatMeasure;
    private getTextWidth;
    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property.
     */
    getFormattingModel(): powerbi.visuals.FormattingModel;
}
