import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import { motion } from "framer-motion";

interface Hub {
  label: string;
  coords: [number, number];
  meta: string;
}

const HUBS: Hub[] = [
  { label: "ZÜRICH", coords: [47.3769, 8.5417], meta: "47.3769° N, 8.5417° E" },
  { label: "KYIV", coords: [50.4501, 30.5234], meta: "50.4501° N, 30.5234° E" },
];

const nodeIcon = L.divIcon({
  className: "",
  html: `<div class="relative w-2.5 h-2.5">
    <span class="absolute -inset-1.5 rounded-full bg-white/40 animate-ping"></span>
    <span class="absolute inset-0 rounded-full bg-white border-2 border-black"></span>
  </div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const bounds: [number, number][] = HUBS.map((hub) => hub.coords);

export default function NetworkNodesMap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="border border-zinc-800 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
        <p className="text-[8px] sm:text-[10px] font-ibm-mono text-zinc-600 tracking-[0.4em] uppercase">
          // NETWORK_NODES
        </p>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[8px] font-ibm-mono text-zinc-400 tracking-[0.2em] uppercase">
            OPERATIONAL
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="h-[240px] sm:h-[300px] w-full relative">
        <MapContainer
          bounds={bounds}
          boundsOptions={{ padding: [50, 50] }}
          scrollWheelZoom={false}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          touchZoom={false}
          doubleClickZoom={false}
          style={{ height: "100%", width: "100%", background: "#09090b" }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <Polyline
            positions={bounds}
            pathOptions={{ color: "#ffffff", weight: 1, opacity: 0.3, dashArray: "3 6" }}
          />
          {HUBS.map((hub) => (
            <Marker key={hub.label} position={hub.coords} icon={nodeIcon}>
              <Tooltip
                permanent
                direction="top"
                offset={[0, -6]}
                opacity={1}
                className="!bg-black !border !border-zinc-700 !rounded-none !shadow-none !text-white !px-1.5 !py-1 font-ibm-mono text-[8px] tracking-[0.25em] uppercase before:!content-none"
              >
                {hub.label}
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Info footer */}
      <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-900 grid grid-cols-2 gap-y-2">
        {HUBS.map((hub) => (
          <div key={hub.label}>
            <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.3em] uppercase">
              {hub.label}
            </p>
            <p className="text-[9px] font-ibm-mono text-zinc-400 mt-0.5">{hub.meta}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
