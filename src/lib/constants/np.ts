export interface NpTrackingData {
  ttn: string;
  status_code: string;
  status: string;
  status_raw: string;
  city_sender: string;
  city_recipient: string;
  warehouse_recipient: string;
  scheduled_date: string | null;
  actual_date: string | null;
  is_delivered: boolean;
  lat: number | null;
  lng: number | null;
}

export type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: NpTrackingData }
  | { status: "error"; error: string };

export type Action =
  | { type: "fetch" }
  | { type: "success"; data: NpTrackingData }
  | { type: "error"; error: string };
