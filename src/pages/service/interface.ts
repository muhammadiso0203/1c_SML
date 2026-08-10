export interface OstatokItem {
  GruppaTMC: string;
  quantity: number;
  amount: number;
}

export interface OstatokResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: OstatokItem[];
}

export interface FinishedProductItem {
  producttype: string;
  remains: number;
  fraction: number;
}

export interface RollsItem {
  division: string;
  remains: number;
  fraction: number;
}

export interface ShipmentItem {
  producttype: string;
  remains: number;
  fraction: number;
}

export interface A1Item {
  General_Plan: number;
  It_remains_to_be_done: number;
  Forecast_for_the_End_of_the_Month: number;
  Days_left_in_the_month: number;
  Required_Release_On_The_Day: number;
  Average_Daily_Output: number;
  Implementation_of_the_Plan: number;
}

export interface A3Item{
  Daily_output: number;
  Monthly_issue: number;
}

export interface Pr010Data {
  A1?: A1Item;
  A7_1?: any[];
  remains_RAW_MATERIALS?: number;
  A7_2: FinishedProductItem[];
  RESIDUAL_FINISHED_PRODUCT: number;
  A7_3?: RollsItem[];
  remainsrolls?: number;
  A5?: ShipmentItem[];
  A6?: ShipmentItem[];
  A3?: A3Item;
  shipment_PER_DAY?: number;
  shipment_PER_month?: number;
}

export interface Pr010Response {
  success: boolean;
  statusCode: number;
  message: string;
  data: Pr010Data;
}
