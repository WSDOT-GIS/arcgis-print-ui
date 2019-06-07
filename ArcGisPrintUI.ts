import PrintTask = require("esri/tasks/PrintTask");
import GPParameter from "./GPParameter";
import template = require("dojo/text!./Templates/ArcGisPrintUI.html");
import { getPrintTaskInfo, createPrintParameters } from "./utils";

// import type references
import EsriMap = require("esri/map");
import { GPTask } from "./GPService";

/**
 * Populates HTML form using service info.
 */
function populateFormFromParameters(form: HTMLFormElement, taskInfo: GPTask) {
    for (let p of taskInfo.parameters) {
        let select = form.querySelector(`[data-gp-parameter='${p.name}']`) as HTMLSelectElement;
        if (select) {
            (p as GPParameter).populateSelectWithChoices(select);
        }
    }
}

/**
 * Creates the print form
 * @param printUrl - URL for the print service.
 * @returns Returns the print form.
 */
function createForm(printUrl: string) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(template, "text/html");
    let form = doc.body.querySelector("form") as PrintTemplateForm;
    form = form.cloneNode(true) as PrintTemplateForm;

    if (printUrl) {
        form.action = printUrl;
    }

    return form;
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
    constructor(printUrl: string, public map?: EsriMap) {
        // Add http: or https: if a protocol-relative URL is detected.
        if (/^\/\//.test(printUrl)) {
            printUrl = window.location.protocol + printUrl;
        }
        this._form = createForm(printUrl);
        this._form.addEventListener("submit", startPrintJob);
        getPrintTaskInfo(this._form.action).then(info => {
            this._printTask = new PrintTask(printUrl, {
                async: info.executionType === "esriExecutionTypeAsynchronous"
            });
            populateFormFromParameters(this._form, info);
        }, error => {
            throw error;
        });

        let self = this;


        function startPrintJob(e: Event) {

            function forceHttps(url: string): string {
                const httpsRe = /^https\:/i;
                // If URL is already https, return input URL.
                if (httpsRe.test(url)) {
                    return url;
                }
                const wsdotUrlRe = /^http\:\/\/data.wsdot.wa.gov\//i;
                if (location.href && httpsRe.test(location.href) && wsdotUrlRe.test(url)) {
                    return url.replace(/^http\:/, "https:");
                }
                return url;
            }

            function createLink(url: string) {
                let a = document.createElement("a");
                a.href = url;
                a.textContent = (url.match(/[^\/]+$/) as string[])[0];
                a.target = "arcgisprintout";
                return a;
            }

            if (self.map) {
                let p = createPrintParameters(self.map, self.form as PrintTemplateForm);

                let list = self._form.querySelector(".print-jobs-list") as HTMLUListElement;

                let item = document.createElement("li");
                let prog = document.createElement("progress");
                item.appendChild(prog);
                list.appendChild(item);

                self.printTask.execute(p).then(function (response: any) {
                    // Remove progress bar.
                    item.removeChild(prog);
                    const url = forceHttps(response.url);
                    fetch(url).then(response => {
                        let link = createLink(url);
                        item.appendChild(link);
                    });


                }, function (error: Error) {
                    item.removeChild(prog);
                    item.textContent = error.message || error.toString();
                });
            }

            e.preventDefault();
        }
    }
    private _printTask: PrintTask;
    private _form: PrintTemplateForm;
    get printTask(): PrintTask {
        return this._printTask;
    }
    get form(): PrintTemplateForm {
        return this._form;
    }
}

export = PrintUI;
