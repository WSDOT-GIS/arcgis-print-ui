define(["require", "exports", "esri/tasks/PrintTask", "dojo/text!./Templates/ArcGisPrintUI.html", "./utils"], function (require, exports, PrintTask, template, utils_1) {
    "use strict";
    /**
     * Populates HTML form using service info.
     */
    function populateFormFromParameters(form, taskInfo) {
        for (var _i = 0, _a = taskInfo.parameters; _i < _a.length; _i++) {
            var p = _a[_i];
            var select = form.querySelector("[data-gp-parameter='" + p.name + "']");
            if (select) {
                p.populateSelectWithChoices(select);
            }
        }
    }
    /**
     * Creates the print form
     * @param printUrl - URL for the print service.
     * @returns Returns the print form.
     */
    function createForm(printUrl) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(template, "text/html");
        var form = doc.body.querySelector("form");
        form = form.cloneNode(true);
        if (printUrl) {
            form.action = printUrl;
        }
        return form;
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
            var _this = this;
            this.map = map;
            // Add http: or https: if a protocol-relative URL is detected.
            if (/^\/\//.test(printUrl)) {
                printUrl = window.location.protocol + printUrl;
            }
            this._form = createForm(printUrl);
            this._form.addEventListener("submit", startPrintJob);
            utils_1.getPrintTaskInfo(this._form.action).then(function (info) {
                _this._printTask = new PrintTask(printUrl, {
                    async: info.executionType === "esriExecutionTypeAsynchronous"
                });
                populateFormFromParameters(_this._form, info);
            }, function (error) {
                throw error;
            });
            var self = this;
            function startPrintJob(e) {
                function createLink(url) {
                    var a = document.createElement("a");
                    a.href = url;
                    a.textContent = url.match(/[^\/]+$/)[0];
                    a.target = "arcgisprintout";
                    return a;
                }
                if (self.map) {
                    var p = utils_1.createPrintParameters(self.map, self.form);
                    var list = self._form.querySelector(".print-jobs-list");
                    var item_1 = document.createElement("li");
                    var prog_1 = document.createElement("progress");
                    item_1.appendChild(prog_1);
                    list.appendChild(item_1);
                    self.printTask.execute(p).then(function (response) {
                        // Remove progress bar.
                        item_1.removeChild(prog_1);
                        fetch(response.url).then(function (response) {
                            var link = createLink(response.url);
                            item_1.appendChild(link);
                        });
                    }, function (error) {
                        item_1.removeChild(prog_1);
                        item_1.textContent = error.message || error.toString();
                    });
                }
                e.preventDefault();
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
