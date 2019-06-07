/// <reference types="arcgis-js-api" />
import PrintTask = require("esri/tasks/PrintTask");
import EsriMap = require("esri/map");
declare class PrintUI {
    map?: EsriMap | undefined;
    /**
     * UI for PrintTask
     * @constructor
     * @param {string} printUrl - URL to an ArcGIS Server print service.
     * @param {esri/Map} [map] - ArcGIS API map. Optional. Can be set later via the map property.
     * @property {esri/Map} map
     * @property {esri/tasks/PrintTask} printTask
     * @property {HTMLFormElement} form
     */
    constructor(printUrl: string, map?: EsriMap | undefined);
    private _printTask;
    private _form;
    readonly printTask: PrintTask;
    readonly form: PrintTemplateForm;
}
export = PrintUI;
