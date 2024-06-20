import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api";
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import DialogConstructorOptions = powerbiVisualsApi.extensibility.visual.DialogConstructorOptions;
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];
var lollipopChartTrainingTest9AFB34FE092740DCB72A8C357700A80A_DEBUG: IVisualPlugin = {
    name: 'lollipopChartTrainingTest9AFB34FE092740DCB72A8C357700A80A_DEBUG',
    displayName: 'LollipopChart_Training_Test',
    class: 'Visual',
    apiVersion: '5.1.0',
    create: (options: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }
        throw 'Visual instance not found';
    },
    createModalDialog: (dialogId: string, options: DialogConstructorOptions, initialState: object) => {
        const dialogRegistry = globalThis.dialogRegistry;
        if (dialogId in dialogRegistry) {
            new dialogRegistry[dialogId](options, initialState);
        }
    },
    custom: true
};
if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["lollipopChartTrainingTest9AFB34FE092740DCB72A8C357700A80A_DEBUG"] = lollipopChartTrainingTest9AFB34FE092740DCB72A8C357700A80A_DEBUG;
}
export default lollipopChartTrainingTest9AFB34FE092740DCB72A8C357700A80A_DEBUG;