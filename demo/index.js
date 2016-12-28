/*global require*/
require([
    "esri/config",
    "esri/arcgis/utils",
    "ArcGisPrintUI",
    "dojo/text!./itemdata.json"
], function (esriConfig, arcgisUtils, ArcGisPrintUI, itemdata) {
    var printUrl = "//data.wsdot.wa.gov/arcgis/rest/services/FishPassage/FishPassageExportWebMap/GPServer/Export Web Map";

    var printForm = new ArcGisPrintUI(printUrl);
    var form = printForm.form;
    document.getElementById("tools").appendChild(form);

    itemdata = JSON.parse(itemdata);

    ["www.wsdot.wa.gov", "data.wsdot.wa.gov"].forEach(function (server) {
        esriConfig.defaults.io.corsEnabledServers.push(server);
    });

    arcgisUtils.createMap({
        itemData: itemdata
    }, "map", {
        mapOptions: {
            center: [-120.80566406246835, 47.41322033015946],
            zoom: 7
        }
    }).then(function (e) {
        printForm.map = e.map;
    });

});