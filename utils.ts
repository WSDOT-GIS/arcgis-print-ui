import * as GPServiceInfo from "./GPService";
import { reviver } from "./GPParameter";

export function getPrintTaskInfo(printUrl: string) {
  // Remove all URL parameters.
  printUrl = printUrl.replace(/\?(.+)$/, "");
  // Append the JSON format parameter.
  printUrl += "?f=json";
  return fetch(printUrl).then(response => {
    return response.text();
  }).then(txt => {
    let taskInfo = JSON.parse(txt, reviver) as GPServiceInfo.GPTask;
    return taskInfo;
  });
}