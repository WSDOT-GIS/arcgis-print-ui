define(["require", "exports", "esri/tasks/PrintTask", "esri/tasks/PrintParameters", "esri/tasks/PrintTemplate", "esri/tasks/LegendLayer", "dojo/text!./Templates/ArcGisPrintUI.html", "./GPParameter"], function (require, exports, PrintTask, PrintParameters, PrintTemplate, LegendLayer, template, GPParameter_1) {
    "use strict";
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
    function populateFormFromParameters(form, svcInfo) {
        for (var _i = 0, _a = svcInfo.parameters; _i < _a.length; _i++) {
            var p = _a[_i];
            var select = form.querySelector("[data-gp-parameter='" + p.name + "']");
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
    function createForm(printUrl) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(template, "text/html");
        var form = doc.body.querySelector("form");
        form = form.cloneNode(true);
        if (printUrl) {
            form.action = printUrl;
            // Remove all URL parameters.
            printUrl = printUrl.replace(/\?(.+)$/, "");
            // Append the JSON format parameter.
            printUrl += "?f=json";
            fetch(printUrl).then(function (response) {
                return response.text();
            }).then(function (txt) {
                var serviceInfo = JSON.parse(txt, GPParameter_1.reviver);
                form.dataset.isAsync = /async/i.test(serviceInfo.executionType);
                populateFormFromParameters(form, serviceInfo);
            });
        }
        return form;
    }
    function getLegendLayersFromMap(map, sublayerThreshold) {
        if (sublayerThreshold === void 0) { sublayerThreshold = 30; }
        var output = [];
        for (var _i = 0, _a = map.layerIds; _i < _a.length; _i++) {
            var layerId = _a[_i];
            var layer = map.getLayer(layerId);
            if (layer.visible && layer.visibleAtMapScale) {
                var legendLayer = new LegendLayer();
                legendLayer.layerId = layer.id;
                if (layer.visibleLayers) {
                    legendLayer.subLayerIds = layer.visibleLayers;
                }
                if (legendLayer.subLayerIds.length < sublayerThreshold) {
                    output.push(legendLayer);
                }
            }
        }
        // Return null if the output array has no elements.
        return output.length > 0 ? output : null;
    }
    function createPrintParameters(map, form) {
        var printParams = new PrintParameters();
        printParams.map = map;
        var printTemplate = new PrintTemplate();
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
    var PrintUI = (function () {
        /**
         * UI for PrintTask
         * @constructor
         * @param {string} printUrl - URL to an ArcGIS Server print service.
         * @param {esri/Map} [map] - ArcGIS API map. Optional. Can be set later via the map property.
         * @property {esri/Map} map
         * @property {esri/tasks/PrintTask} printTask
         * @property {HTMLFormElement} form
         */
        function PrintUI(printUrl, map) {
            this.map = map;
            // Add http: or https: if a protocol-relative URL is detected.
            if (/^\/\//.test(printUrl)) {
                printUrl = window.location.protocol + printUrl;
            }
            this._form = createForm(printUrl);
            var self = this;
            function startPrintJob() {
                var p = createPrintParameters(self.map, self.form);
                var list = self._form.querySelector(".print-jobs-list");
                var item = document.createElement("li");
                var prog = document.createElement("progress");
                item.appendChild(prog);
                list.appendChild(item);
                function createLink(url) {
                    var a = document.createElement("a");
                    a.href = url;
                    a.textContent = url.match(/[^\/]+$/)[0];
                    a.target = "arcgisprintout";
                    return a;
                }
                self.printTask.execute(p).then(function (response) {
                    // Remove progress bar.
                    item.removeChild(prog);
                    fetch(response.url).then(function (response) {
                        var link = createLink(response.url);
                        item.appendChild(link);
                    });
                }, function (error) {
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
            function createForm(printUrl) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(template, "text/html");
                var form = doc.body.querySelector("form");
                form = form.cloneNode(true);
                if (printUrl) {
                    // Remove all URL parameters.
                    var requestUrl = printUrl.replace(/\?(.+)$/, "") + "?f=json";
                    var promise = fetch(requestUrl);
                    promise.then(function (response) {
                        return response.text();
                    }).then(function (txt) {
                        var serviceInfo = JSON.parse(txt, GPParameter_1.reviver);
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
        Object.defineProperty(PrintUI.prototype, "printTask", {
            get: function () {
                return this._printTask;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PrintUI.prototype, "form", {
            get: function () {
                return this._form;
            },
            enumerable: true,
            configurable: true
        });
        return PrintUI;
    }());
    return PrintUI;
});
