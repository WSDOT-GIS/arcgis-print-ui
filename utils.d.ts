/// <reference types="arcgis-js-api" />
import * as GPServiceInfo from "./GPService";
import EsriMap = require("esri/map");
import LegendLayer = require("esri/tasks/LegendLayer");
import PrintParameters = require("esri/tasks/PrintParameters");
export declare function getPrintTaskInfo(printUrl: string): Promise<GPServiceInfo.GPTask>;
export declare function getLegendLayersFromMap(map: EsriMap, sublayerThreshold?: number): LegendLayer[] | null;
export declare function createPrintParameters(map: EsriMap, form: PrintTemplateForm): PrintParameters;
