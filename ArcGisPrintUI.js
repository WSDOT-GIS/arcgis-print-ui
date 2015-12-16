/*global define*/
define([
    "esri/tasks/PrintTask",
    "esri/tasks/PrintParameters",
    "esri/tasks/PrintTemplate",
    "dojo/_base/Deferred",
    "dojo/text!./Templates/ArcGisPrintUI.html"
], function (PrintTask, PrintParameters, PrintTemplate, Deferred, template) {

    /**
     * @external ScaleBarOptions
     */


    /**
     * @external LayoutOptions
     * @see {@link http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#/ExportWebMap_specification/02r3000001mz000000/#ESRI_SECTION1_58F5F403FCF048C2A5EBEF921BB97A10|layoutOptions}
     * @property {string} titleText
     * @property {string} authorText
     * @property {string} copyrightText
     * 
     */

    function GPParameter(options) {
        this.name = options.name || null;
        this.dataType = options.dataType || null;
        this.displayName = options.displayName || null;
        this.description = options.description || null;
        this.direction = options.direction || null;
        this.defaultValue = options.defaultValue || null;
        this.parameterType = options.parameterType || null;
        this.category = options.category || null;
        this.choiceList = options.choiceList || null;
    }

    var reviver = function (k, v) {
        if (v && v.hasOwnProperty && v.hasOwnProperty("parameterType")) {
            v = new GPParameter(v);
        }
        return v;
    };

    GPParameter.prototype.populateSelectWithChoices = function (selectNode) {
        if (!this.choiceList || !Array.isArray(this.choiceList)) {
            throw new TypeError("The choiceList property is not an array.");
        }

        var self = this;

        this.choiceList.forEach(function (choice) {
            var option = document.createElement("option");
            option.value = choice;
            option.textContent = choice;
            if (self.defaultValue === choice) {
                option.setAttribute("selected", "selected");
            }
            selectNode.appendChild(option);
        });
    };

    function populateFormFromParameters(form, svcInfo) {
        var i, l, p, select;
        for (var i = 0, l = svcInfo.parameters.length; i < l; i++) {
            p = svcInfo.parameters[i];
            select = form.querySelector("[data-gp-parameter='" + p.name + "']");
            if (select) {
                p.populateSelectWithChoices(select);
            }
        }
    }

    /**
     * Creates the print form
     * @param {string} printURL
     */
    function createForm(printUrl) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(template, "text/html");
        var form = doc.body.querySelector("form");
        form = form.cloneNode(true);

        var httpRequest;



        if (printUrl) {
            form.action = printUrl;
            // Remove all URL parameters.
            printUrl = printUrl.replace(/\?(.+)$/, "");
            // Append the JSON format parameter.
            printUrl += "?f=json";
            httpRequest = new XMLHttpRequest();
            httpRequest.open("get", printUrl);
            httpRequest.onloadend = function () {
                var serviceInfo;
                if (this.status !== 200 || (this.response && this.response.error)) {
                    return;
                }

                serviceInfo = JSON.parse(this.response, reviver);

                form.dataset.isAsync = /async/i.test(serviceInfo.executionType);

                populateFormFromParameters(form, serviceInfo);
            }
            httpRequest.send();
        }

        return form;
    }

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
        var form = createForm(printUrl);
        this.map = map || null;
        var printTask = null;

        var self = this;

        function createPrintParameters() {
            var printParams = new PrintParameters();
            printParams.map = self.map;

            var printTemplate = new PrintTemplate();
            // TODO: printTemplate.exportOptions

            printTemplate.format = form.format.value;
            printTemplate.layout = form.layout.value;
            printTemplate.titleText = form.titleText.value;
            printTemplate.authorText = form.authorText.value;
            printTemplate.copyrightText = form.copyrightText.value;
            printTemplate.scalebarUnit = form.scalebarUnit.value;

            printParams.template = printTemplate;

            return printParams;
        }

        function checkFile(url) {
            var xmlhttp = new XMLHttpRequest();
            // Using a synchronous call...
            xmlhttp.open("GET", url, false);
            xmlhttp.send();

            if (xmlhttp.status === 500) {
                return false;
            } else {
                return true;
            }
        }

        function waitForFile(url) {
            var d = new Deferred();
            var fileReady = false;

            do {
                fileReady = checkFile(url);
            } while (!fileReady);

            d.resolve();
            return d;
        }

        function startPrintJob() {

            var p = createPrintParameters();

            var list = form.querySelector(".print-jobs-list");

            var item = document.createElement("li");
            var prog = document.createElement("progress");
            item.appendChild(prog);
            list.appendChild(item);

            function createLink(url) {
                var a = document.createElement("a");
                a.href = url;
                a.textContent = url.match(/[^\/]+$/);
                a.target = "arcgisprintout";
                return a;
            }

            self.printTask.execute(p).then(function (response) {
                // Remove progress bar.
                item.removeChild(prog);

                var fileDef = waitForFile(response.url);

                fileDef.then(function() {
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
         * @param {string} printURL
         */
        function createForm(printUrl) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(template, "text/html");
            var form = doc.body.querySelector("form");
            form = form.cloneNode(true);

            var httpRequest;



            if (printUrl) {
                // Remove all URL parameters.
                httpRequest = new XMLHttpRequest();
                httpRequest.open("get", printUrl.replace(/\?(.+)$/, "") + "?f=json");
                httpRequest.onloadend = function () {
                    var serviceInfo;
                    if (this.status !== 200 || (this.response && this.response.error)) {
                        return;
                    }

                    serviceInfo = JSON.parse(this.response, reviver);

                    printTask = new PrintTask(printUrl, {
                        async: /async/i.test(serviceInfo.executionType)
                    });

                    populateFormFromParameters(form, serviceInfo);
                }
                httpRequest.send();
            }


            form.onsubmit = startPrintJob;

            return form;
        }

        Object.defineProperties(this, {
            printTask: {
                get: function() {
                    return printTask;
                }
            },
            form: {
                get: function () {
                    return form;
                }
            }
        });
    }

    return PrintUI;

});