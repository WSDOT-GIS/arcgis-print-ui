interface GPParameterInterface {
    name?: string;
    dataType?: string;
    displayName?: string;
    description?: string;
    direction?: string;
    defaultValue?: any;
    parameterType?: string;
    category?: string;
    choiceList?: string[];
}

interface PrintTemplateForm extends HTMLFormElement {
    format: HTMLInputElement;
    layout: HTMLInputElement;
    titleText: HTMLInputElement;
    authorText: HTMLInputElement;
    copyrightText: HTMLInputElement;
    scalebarUnit: HTMLInputElement;
}