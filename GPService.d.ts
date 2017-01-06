export type esriExecutionType = "esriExecutionTypeAsynchronous" | "esriExecutionTypeSynchronous"

export interface GPService {
  currentVersion?: number,
  serviceDescription?: string,
  tasks?: string[],
  executionType?: esriExecutionType,
  resultMapServerName?: string,
  maximumRecords?: number[]
}

export interface GPParameter {
  name: string, // paramName1
  dataType: string, // dataType1
  displayName?: string, // displayName1
  description?: string, // description //Added at 10.1 SP1
  direction: string, // direction1
  defaultValue?: any,
  parameterType: string, // parameterType1
  category?: string, // paramCategory1
  choiceList?: string[];
}

export interface GPTask {
  name: string, // taskName
  displayName: string, // displayName
  description: string, // description //Added at 10.1 SP1
  category: string, // category
  helpUrl: string, // url
  executionType: esriExecutionType, // executionType
  parameters: GPParameter[]
}
