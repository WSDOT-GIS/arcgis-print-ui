// see http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#/ExportWebMap_specification/02r3000001mz000000/#ESRI_SECTION1_58F5F403FCF048C2A5EBEF921BB97A10

export interface ScaleBarOptions {
  metricUnit?: "esriMeters" | "esriKilometers";
  metricLabel?: string;
  nonMetricUnit?: "esriFeet" | "esriYards" | "esriMiles" | "esriNauticalMiles";
  nonMetricLabel?: string;
}

export interface LegendOptions {
  operationalLayers?: any[];
}

export interface LayoutOptions {
  titleText?: string;
  authorText?: string;
  copyrightText?: string;
  scaleBarOptions?: ScaleBarOptions;
  customTextElements?: any[];
  legendOptions?: LegendOptions
}

// export interface MapOptions {

// }

// export interface OperationalLayer {
//   id?: string;
//   url: string;
//   token?: string;
//   title?: string;
//   visibility?: boolean;
//   minScale?: number;
//   maxScale?: number;
// }

// export interface MapServiceLayer extends OperationalLayer {
//   visibleLayers?: number[];
//   layers?: any[]; //Layer[];

// }

// export interface BaseMap {

// }

// export interface ExportWebMapSpecification {
//   operationalLayers?: OperationalLayer[]
// }