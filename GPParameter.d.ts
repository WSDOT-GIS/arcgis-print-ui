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
    constructor(options: GPParameterInterface);
    populateSelectWithChoices: (this: GPParameter, selectNode: HTMLSelectElement) => void;
}
export declare function reviver(k: string, v: any): any;
