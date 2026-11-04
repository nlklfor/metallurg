import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  AttributionControl,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import { useNpTracking } from "@/hooks/useNpTracking";
import type { NpTrackingData } from "@/lib/constants/np";
import { maskName, maskTtn, npUrl } from "@/utils/trackUtils";
import { cn } from "@/lib/utils";
import { findCity, type CityPoint } from "@/lib/uaCities";

// NP_LIVE_STATUS: dark NP map (when Nova Poshta returns coordinates) + status panel.

// Same dark map and diamond marker as before the redesign.
const markerIcon = L.divIcon({
  className: "",
  html: `<div style="width:10px;height:10px;background:#ffffff;border:2px solid #000000;transform:rotate(45deg);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// City node with a ping, as on the old NETWORK_NODES map.
const nodeIcon = L.divIcon({
  className: "",
  html: `<div class="relative w-2.5 h-2.5">
    <span class="absolute -inset-1.5 rounded-full bg-white/40 animate-ping"></span>
    <span class="absolute inset-0 rounded-full bg-white border-2 border-black"></span>
  </div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

// Carto's dark tiles now need an API key, so we use free OpenStreetMap tiles
// and darken them with a CSS filter (.mtl-dark-tiles in index.css).
// OSM's tile policy requires the attribution shown in the corner.
const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';
const TOOLTIP =
  "!rounded-none !border !border-zinc-700 !bg-black !px-1.5 !py-1 !font-mono !text-[10px] !tracking-[0.15em] !text-white !shadow-none before:!hidden";

const STATIC_MAP = {
  scrollWheelZoom: false,
  attributionControl: false,
  zoomControl: false,
  dragging: false,
  touchZoom: false,
  doubleClickZoom: false,
  keyboard: false,
} as const;

/**
 * Sender city → recipient city with a dashed line and labelled nodes. Falls
 * back to the branch point alone when the cities aren't known.
 */
function RouteMap({
  from,
  to,
  branch,
}: {
  from: CityPoint | null;
  to: CityPoint | null;
  branch: [number, number] | null;
}) {
  const end: [number, number] | null = branch ?? to?.coords ?? null;
  const showRoute = !!from && !!end && from.label !== to?.label;

  if (!showRoute) {
    if (!end) return null;
    return (
      <MapContainer
        center={end}
        zoom={13}
        {...STATIC_MAP}
        style={{ height: "100%", width: "100%", background: "#09090b" }}
      >
        <TileLayer url={TILES} attribution={ATTRIBUTION} className="mtl-dark-tiles" />
        <AttributionControl position="bottomright" prefix={false} />
        <Marker position={end} icon={markerIcon} />
      </MapContainer>
    );
  }

  const points: [number, number][] = [from.coords, end];
  return (
    <MapContainer
      bounds={points}
      boundsOptions={{ paddingTopLeft: [110, 56], paddingBottomRight: [110, 28] }}
      {...STATIC_MAP}
      style={{ height: "100%", width: "100%", background: "#09090b" }}
    >
      <TileLayer url={TILES} attribution={ATTRIBUTION} className="mtl-dark-tiles" />
      <AttributionControl position="bottomright" prefix={false} />
      <Polyline
        positions={points}
        pathOptions={{ color: "#ffffff", weight: 1, opacity: 0.4, dashArray: "3 6" }}
      />
      <Marker position={from.coords} icon={nodeIcon}>
        <Tooltip permanent direction="top" offset={[0, -6]} opacity={1} className={TOOLTIP}>
          {from.label} // SENDER
        </Tooltip>
      </Marker>
      <Marker position={end} icon={branch ? markerIcon : nodeIcon}>
        <Tooltip permanent direction="top" offset={[0, -6]} opacity={1} className={TOOLTIP}>
          {to?.label ?? "BRANCH"}
          {branch && " · BRANCH"}
        </Tooltip>
      </Marker>
    </MapContainer>
  );
}

function formatDate(raw: string | null): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="flex-shrink-0 text-zinc-500">{k}</span>
      <span className="min-w-0 text-right">{v}</span>
    </div>
  );
}

function Panel({ data, recipient }: { data: NpTrackingData; recipient: string }) {
  const branch: [number, number] | null =
    data.lat !== null && data.lng !== null ? [data.lat, data.lng] : null;
  const from = findCity(data.city_sender);
  const to = findCity(data.city_recipient);
  const hasMap = !!branch || !!to;
  const eta = formatDate(data.scheduled_date);
  const delivered = formatDate(data.actual_date);

  return (
    <div
      className={cn(
        "grid grid-cols-1 border border-zinc-700",
        hasMap && "lg:grid-cols-[minmax(0,1fr)_320px]"
      )}
    >
      {hasMap && (
        <div className="order-2 h-[200px] border-t border-zinc-700 lg:order-1 lg:h-auto lg:min-h-[300px] lg:border-r lg:border-t-0">
          <RouteMap from={from} to={to} branch={branch} />
        </div>
      )}

      <div className="order-1 flex flex-col gap-3 p-3 text-[11px] lg:order-2 lg:gap-3.5 lg:p-5 lg:text-[12px]">
        <div className="flex items-center justify-between">
          <span className="eyebrow text-[10px]">// NP_LIVE_STATUS</span>
          <span className="flex items-center gap-1.5 text-[10px] tracking-[0.15em]">
            <span aria-hidden="true" className="h-1.5 w-1.5 bg-status-ok" />
            {data.is_delivered ? "RECEIVED" : "LIVE"}
          </span>
        </div>
        <Row k="TTN" v={maskTtn(data.ttn)} />
        <Row k="STATUS" v={data.status?.toUpperCase() || "—"} />
        {delivered ? <Row k="RECEIVED" v={delivered} /> : <Row k="ETA" v={eta ?? "—"} />}
        {data.warehouse_recipient && (
          <Row k="BRANCH" v={<span className="leading-snug">{data.warehouse_recipient}</span>} />
        )}
        <Row k="RECIPIENT" v={recipient} />
        <a
          href={npUrl(data.ttn)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto hidden h-12 items-center justify-center border border-zinc-700 text-[11px] tracking-[0.15em] transition-colors hover:bg-white hover:!text-black lg:flex"
        >
          OPEN IN NOVA POSHTA →
        </a>
      </div>
    </div>
  );
}

export default function NpTrackingPanel({
  ttn,
  customerName,
}: {
  ttn: string;
  customerName: string;
}) {
  const { data, isLoading, error } = useNpTracking(ttn);

  if (isLoading) {
    return (
      <p className="border border-zinc-800 px-4 py-5 text-[11px] tracking-[0.15em] text-zinc-500">
        // FETCHING_NP_STATUS<span className="animate-blink-cursor text-white">█</span>
      </p>
    );
  }

  if (data) return <Panel data={data} recipient={maskName(customerName)} />;

  return (
    <div className="flex flex-col gap-1.5 border border-zinc-800 p-4 text-[12px]">
      <span className="eyebrow text-[10px]">// NP_STATUS_UNAVAILABLE</span>
      <span className="text-zinc-500">
        {error
          ? "Nova Poshta isn't answering right now. Your parcel is on its way — check it on their site."
          : "No Nova Poshta data yet."}
      </span>
      <span className="text-[11px]">TTN {maskTtn(ttn)}</span>
    </div>
  );
}
