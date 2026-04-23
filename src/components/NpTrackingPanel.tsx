import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { motion } from "framer-motion";
import type { NpTrackingData } from "@/lib/constants/np";

const markerIcon = L.divIcon({
  className: "",
  html: `<div style="width:10px;height:10px;background:#ffffff;border:2px solid #000000;transform:rotate(45deg);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function formatDate(raw: string | null): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function NpTrackingPanel({ data }: { data: NpTrackingData }) {
  const hasCoords = data.lat !== null && data.lng !== null;
  const scheduled = formatDate(data.scheduled_date);
  const delivered = formatDate(data.actual_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="mt-4 border border-zinc-800 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
        <p className="text-[8px] font-ibm-mono text-zinc-600 tracking-[0.4em] uppercase">
          // NP_LIVE_STATUS
        </p>
        <span
          className={`text-[9px] font-archivo-black tracking-[0.15em] uppercase ${
            data.is_delivered ? "text-green-400" : "text-white"
          }`}
        >
          {data.status}
        </span>
      </div>

      {/* Map */}
      {hasCoords && (
        <div className="h-[160px] w-full relative">
          <MapContainer
            center={[data.lat!, data.lng!]}
            zoom={13}
            scrollWheelZoom={false}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            touchZoom={false}
            doubleClickZoom={false}
            style={{ height: "100%", width: "100%", background: "#09090b" }}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <Marker position={[data.lat!, data.lng!]} icon={markerIcon} />
          </MapContainer>
        </div>
      )}

      {/* Info grid */}
      <div className="px-4 py-3 grid grid-cols-2 gap-y-3 bg-zinc-950 border-t border-zinc-900">
        {data.warehouse_recipient && (
          <div className="col-span-2">
            <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.3em] uppercase">
              BRANCH
            </p>
            <p className="text-[10px] font-ibm-mono text-zinc-300 mt-0.5 leading-snug">
              {data.warehouse_recipient}
            </p>
          </div>
        )}
        {data.city_recipient && (
          <div>
            <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.3em] uppercase">
              CITY
            </p>
            <p className="text-[10px] font-ibm-mono text-zinc-300 mt-0.5">{data.city_recipient}</p>
          </div>
        )}
        {scheduled && !delivered && (
          <div>
            <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.3em] uppercase">
              EST. DELIVERY
            </p>
            <p className="text-[10px] font-ibm-mono text-zinc-300 mt-0.5">{scheduled}</p>
          </div>
        )}
        {delivered && (
          <div>
            <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.3em] uppercase">
              DELIVERED
            </p>
            <p className="text-[10px] font-ibm-mono text-green-400 mt-0.5">{delivered}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between">
        <span className="text-[8px] font-ibm-mono text-zinc-400 tracking-widest">
          TTN: {data.ttn}
        </span>
        <a
          href={`https://novaposhta.ua/tracking/?cargo_number=${data.ttn}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[8px] font-ibm-mono text-zinc-600 hover:text-white tracking-[0.2em] uppercase transition-colors"
        >
          VIEW_ON_NP →
        </a>
      </div>
    </motion.div>
  );
}
