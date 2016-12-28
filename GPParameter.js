define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * GPParameter
     */
    var GPParameter = (function () {
        function GPParameter(options) {
            this.populateSelectWithChoices = function (selectNode) {
                if (!this.choiceList || !Array.isArray(this.choiceList)) {
                    throw new TypeError("The choiceList property is not an array.");
                }
                var self = this;
                var choices = this.choiceList;
                for (var _i = 0, choices_1 = choices; _i < choices_1.length; _i++) {
                    var choice = choices_1[_i];
                    var option = document.createElement("option");
                    option.value = choice;
                    option.textContent = choice;
                    if (self.defaultValue === choice) {
                        option.setAttribute("selected", "selected");
                    }
                    selectNode.appendChild(option);
                }
            };
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
        return GPParameter;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = GPParameter;
    function reviver(k, v) {
        if (v && v.hasOwnProperty && v.hasOwnProperty("parameterType")) {
            v = new GPParameter(v);
        }
        return v;
    }
    exports.reviver = reviver;
    ;
});
