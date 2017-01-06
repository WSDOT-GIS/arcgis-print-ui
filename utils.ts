import * as GPServiceInfo from "./GPService";
import { reviver } from "./GPParameter";
import EsriMap = require("esri/map");
import LegendLayer = require("esri/tasks/LegendLayer");
import ArcGISDynamicMapServiceLayer = require("esri/layers/ArcGISDynamicMapServiceLayer");
import PrintParameters = require("esri/tasks/PrintParameters");
import PrintTemplate = require("esri/tasks/PrintTemplate");

export function getPrintTaskInfo(printUrl: string) {
  // Remove all URL parameters.
  printUrl = printUrl.replace(/\?(.+)$/, "");
  // Append the JSON format parameter.
  printUrl += "?f=json";
  return fetch(printUrl).then(response => {
    return response.text();
  }).then(txt => {
    let taskInfo = JSON.parse(txt, reviver) as GPServiceInfo.GPTask;
    return taskInfo;
  });
}

export function getLegendLayersFromMap(map: EsriMap, sublayerThreshold: number = 30) {
    let output: LegendLayer[] = [];
    for (let layerId of map.layerIds) {
        let layer = map.getLayer(layerId) as ArcGISDynamicMapServiceLayer;
        if (layer.visible && layer.visibleAtMapScale) {
            let legendLayer = new LegendLayer();
            legendLayer.layerId = layer.id;
            if (layer.visibleLayers) {
                (legendLayer as any).subLayerIds = layer.visibleLayers;
            }
            if (legendLayer.subLayerIds.length < sublayerThreshold) {
                output.push(legendLayer);
            }
        }
    }

    // Return null if the output array has no elements.
    return output.length > 0 ? output : null;
}

export function createPrintParameters(map: EsriMap, form: PrintTemplateForm) {
    let printParams = new PrintParameters();
    printParams.map = map;

    let printTemplate = new PrintTemplate();
    // TODO: printTemplate.exportOptions

    printTemplate.format = form.format.value;
    printTemplate.layout = form.layout.value;
    printTemplate.layoutOptions = {
        titleText: form.titleText.value,
        authorText: form.authorText.value,
        copyrightText: form.copyrightText.value,
        scalebarUnit: form.scalebarUnit.value,
        legendLayers: getLegendLayersFromMap(map)
    };

    printParams.template = printTemplate;

    return printParams;
}