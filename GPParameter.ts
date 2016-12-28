/**
 * GPParameter
 */
export default class GPParameter {
  name: string | null;
  dataType: string | null;
  displayName: string | null;
  description: string | null;
  direction: string | null;
  defaultValue: any | null;
  parameterType: string | null;
  category: string | null;
  choiceList: string[] | null;
  constructor(options: GPParameterInterface) {
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
  populateSelectWithChoices = function (this: GPParameter, selectNode: HTMLSelectElement) {
    if (!this.choiceList || !Array.isArray(this.choiceList)) {
      throw new TypeError("The choiceList property is not an array.");
    }

    let self = this;
    let choices = this.choiceList;

    for (let choice of choices) {
      let option = document.createElement("option");
      option.value = choice;
      option.textContent = choice;
      if (self.defaultValue === choice) {
        option.setAttribute("selected", "selected");
      }
      selectNode.appendChild(option);
    }
  };
}

export function reviver(k: string, v: any) {
  if (v && v.hasOwnProperty && v.hasOwnProperty("parameterType")) {
    v = new GPParameter(v);
  }
  return v;
};