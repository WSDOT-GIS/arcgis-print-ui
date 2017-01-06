define(["require", "exports", "./GPParameter"], function (require, exports, GPParameter_1) {
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
});
