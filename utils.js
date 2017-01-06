define(["require", "exports", "./GPParameter", "esri/tasks/LegendLayer", "esri/tasks/PrintParameters", "esri/tasks/PrintTemplate"], function (require, exports, GPParameter_1, LegendLayer, PrintParameters, PrintTemplate) {
    "use strict";
    function getPrintTaskInfo(printUrl) {
        // Remove all URL parameters.
        printUrl = printUrl.replace(/\?(.+)$/, "");
        // Append the JSON format parameter.
        printUrl += "?f=json";
        return fetch(printUrl).then(function (response) {
            return response.text();
        }).then(function (txt) {
            var taskInfo = JSON.parse(txt, GPParameter_1.reviver);
            return taskInfo;
        });
    }
    exports.getPrintTaskInfo = getPrintTaskInfo;
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
    exports.getLegendLayersFromMap = getLegendLayersFromMap;
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
    exports.createPrintParameters = createPrintParameters;
});
