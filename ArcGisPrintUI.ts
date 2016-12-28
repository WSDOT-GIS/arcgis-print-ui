import PrintTask = require("esri/tasks/PrintTask");
import PrintParameters = require("esri/tasks/PrintParameters");
import PrintTemplate = require("esri/tasks/PrintTemplate");
import LegendLayer = require("esri/tasks/LegendLayer");
import Deferred = require("dojo/_base/Deferred");
import template = require("dojo/text!./Templates/ArcGisPrintUI.html");
import GPParameter from "./GPParameter";
import { reviver } from "./GPParameter";

import EsriMap = require("esri/map");
import Layer = require("esri/layers/layer");
import ArcGISDynamicMapServiceLayer = require("esri/layers/ArcGISDynamicMapServiceLayer");

/**
 * @external ScaleBarOptions
 */

/**
 * @external LayoutOptions
 * @see {@link http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#/ExportWebMap_specification/02r3000001mz000000/#ESRI_SECTION1_58F5F403FCF048C2A5EBEF921BB97A10|layoutOptions}
 * @property {string} titleText
 * @property {string} authorText
 * @property {string} copyrightText
 */

function populateFormFromParameters(form: HTMLFormElement, svcInfo: any) {
    for (let p of svcInfo.parameters) {
        let select = form.querySelector("[data-gp-parameter='" + p.name + "']");
        if (select) {
            p.populateSelectWithChoices(select);
        }
    }
}

/**
 * Creates the print form
 * @param {string} printUrl - URL for the print service.
 * @returns {HTMLFormElement} Returns the print form.
 */
function createForm(printUrl: string) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(template, "text/html");
    let form = doc.body.querySelector("form") as HTMLFormElement;
    form = form.cloneNode(true) as HTMLFormElement;

    if (printUrl) {
        form.action = printUrl;
        // Remove all URL parameters.
        printUrl = printUrl.replace(/\?(.+)$/, "");
        // Append the JSON format parameter.
        printUrl += "?f=json";

        fetch(printUrl).then(response => {
            return response.text();
        }).then(txt => {
            let serviceInfo = JSON.parse(txt, reviver);
            (form.dataset as any).isAsync = /async/i.test(serviceInfo.executionType);
            populateFormFromParameters(form, serviceInfo);
        });
    }

    return form;
}

function getLegendLayersFromMap(map: EsriMap, sublayerThreshold: number = 30) {
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

function createPrintParameters(map: EsriMap, form: PrintTemplateForm) {
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

class PrintUI {
    /**
     * UI for PrintTask
     * @constructor
     * @param {string} printUrl - URL to an ArcGIS Server print service.
     * @param {esri/Map} [map] - ArcGIS API map. Optional. Can be set later via the map property.
     * @property {esri/Map} map
     * @property {esri/tasks/PrintTask} printTask
     * @property {HTMLFormElement} form
     */
    constructor(printUrl: string, public map: EsriMap) {
        // Add http: or https: if a protocol-relative URL is detected.
        if (/^\/\//.test(printUrl)) {
            printUrl = window.location.protocol + printUrl;
        }
        this._form = createForm(printUrl);

        let self = this;



        function startPrintJob() {

            let p = createPrintParameters(self.map, self.form as PrintTemplateForm);

            let list = self._form.querySelector(".print-jobs-list") as HTMLUListElement;

            let item = document.createElement("li");
            let prog = document.createElement("progress");
            item.appendChild(prog);
            list.appendChild(item);

            function createLink(url: string) {
                let a = document.createElement("a");
                a.href = url;
                a.textContent = (url.match(/[^\/]+$/) as string[])[0];
                a.target = "arcgisprintout";
                return a;
            }

            self.printTask.execute(p).then(function (response: any) {
                // Remove progress bar.
                item.removeChild(prog);
                fetch(response.url as string).then(response => {
                    let link = createLink(response.url);
                    item.appendChild(link);
                });


            }, function (error: Error) {
                item.removeChild(prog);
                item.textContent = error.message || error.toString();
            });

            return false;
        }

        /**
         * Creates the print form
         * @param {string} printUrl - URL for the print service
         * @returns {HTMLFormElement} Returns the created HTML form.
         */
        function createForm(printUrl: string) {
            let parser = new DOMParser();
            let doc = parser.parseFromString(template, "text/html");
            let form: HTMLFormElement = doc.body.querySelector("form") as HTMLFormElement;
            form = form.cloneNode(true) as HTMLFormElement;

            if (printUrl) {
                // Remove all URL parameters.
                let requestUrl = printUrl.replace(/\?(.+)$/, "") + "?f=json";
                let promise = fetch(requestUrl);
                promise.then(response => {
                    return response.text();
                }).then(txt => {
                    let serviceInfo = JSON.parse(txt, reviver);
                    if (!serviceInfo.error) {
                        self._printTask = new PrintTask(printUrl, {
                            async: /async/i.test(serviceInfo.executionType)
                        });
                        populateFormFromParameters(form, serviceInfo);
                    }
                });
            }


            form.onsubmit = startPrintJob;

            return form;
        }
    }
    private _printTask: PrintTask;
    private _form: HTMLFormElement;
    get printTask(): PrintTask {
        return this._printTask;
    }
    get form(): HTMLFormElement {
        return this._form;
    }
}

export = PrintUI;
