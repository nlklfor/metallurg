// Coordinates of Ukrainian cities for the tracking route map, so we can draw
// sender → recipient without a geocoding API. Names as Nova Poshta returns
// them (Ukrainian). Unknown cities simply aren't drawn.

export interface CityPoint {
  /** Latin label shown on the map. */
  label: string;
  coords: [number, number];
}

const CITIES: Record<string, CityPoint> = {
  київ: { label: "KYIV", coords: [50.4501, 30.5234] },
  львів: { label: "LVIV", coords: [49.8397, 24.0297] },
  харків: { label: "KHARKIV", coords: [49.9935, 36.2304] },
  одеса: { label: "ODESA", coords: [46.4825, 30.7233] },
  дніпро: { label: "DNIPRO", coords: [48.4647, 35.0462] },
  запоріжжя: { label: "ZAPORIZHZHIA", coords: [47.8388, 35.1396] },
  вінниця: { label: "VINNYTSIA", coords: [49.2331, 28.4682] },
  полтава: { label: "POLTAVA", coords: [49.5883, 34.5514] },
  чернігів: { label: "CHERNIHIV", coords: [51.4982, 31.2893] },
  черкаси: { label: "CHERKASY", coords: [49.4444, 32.0598] },
  житомир: { label: "ZHYTOMYR", coords: [50.2547, 28.6587] },
  суми: { label: "SUMY", coords: [50.9077, 34.7981] },
  хмельницький: { label: "KHMELNYTSKYI", coords: [49.4229, 26.9871] },
  чернівці: { label: "CHERNIVTSI", coords: [48.2921, 25.9358] },
  рівне: { label: "RIVNE", coords: [50.6199, 26.2516] },
  тернопіль: { label: "TERNOPIL", coords: [49.5535, 25.5948] },
  "івано-франківськ": { label: "IVANO-FRANKIVSK", coords: [48.9226, 24.7111] },
  луцьк: { label: "LUTSK", coords: [50.7472, 25.3254] },
  ужгород: { label: "UZHHOROD", coords: [48.6208, 22.2879] },
  кропивницький: { label: "KROPYVNYTSKYI", coords: [48.5079, 32.2623] },
  миколаїв: { label: "MYKOLAIV", coords: [46.975, 31.9946] },
  херсон: { label: "KHERSON", coords: [46.6354, 32.6169] },
  "кривий ріг": { label: "KRYVYI RIH", coords: [47.9105, 33.3918] },
  "біла церква": { label: "BILA TSERKVA", coords: [49.7968, 30.1311] },
  бровари: { label: "BROVARY", coords: [50.5113, 30.7905] },
  бориспіль: { label: "BORYSPIL", coords: [50.3527, 30.9551] },
  ірпінь: { label: "IRPIN", coords: [50.5218, 30.2506] },
  буча: { label: "BUCHA", coords: [50.5436, 30.212] },
  вишневе: { label: "VYSHNEVE", coords: [50.3897, 30.37] },
  обухів: { label: "OBUKHIV", coords: [50.1072, 30.6211] },
  кременчук: { label: "KREMENCHUK", coords: [49.0659, 33.4204] },
  "кам'янець-подільський": { label: "KAMIANETS-PODILSKYI", coords: [48.6845, 26.5856] },
  "кам'янське": { label: "KAMIANSKE", coords: [48.5076, 34.6132] },
  мукачево: { label: "MUKACHEVO", coords: [48.4393, 22.7178] },
  дрогобич: { label: "DROHOBYCH", coords: [49.3497, 23.5069] },
  стрий: { label: "STRYI", coords: [49.2622, 23.8561] },
  калуш: { label: "KALUSH", coords: [49.027, 24.36] },
  коломия: { label: "KOLOMYIA", coords: [48.531, 25.04] },
  ковель: { label: "KOVEL", coords: [51.2152, 24.7086] },
  умань: { label: "UMAN", coords: [48.7484, 30.2218] },
  бердичів: { label: "BERDYCHIV", coords: [49.8994, 28.6027] },
  "слов'янськ": { label: "SLOVIANSK", coords: [48.8526, 37.605] },
  краматорськ: { label: "KRAMATORSK", coords: [48.7386, 37.5844] },
  павлоград: { label: "PAVLOHRAD", coords: [48.5335, 35.8708] },
  нікополь: { label: "NIKOPOL", coords: [47.5711, 34.3964] },
  ізмаїл: { label: "IZMAIL", coords: [45.3517, 28.8365] },
  чорноморськ: { label: "CHORNOMORSK", coords: [46.3014, 30.6556] },
  шостка: { label: "SHOSTKA", coords: [51.8634, 33.4698] },
  конотоп: { label: "KONOTOP", coords: [51.2402, 33.2026] },
  ніжин: { label: "NIZHYN", coords: [51.048, 31.8869] },
  лубни: { label: "LUBNY", coords: [50.0186, 32.9869] },
  олександрія: { label: "OLEKSANDRIIA", coords: [48.6696, 33.1176] },
};

/** "Бровари (Київська обл.)", "м. Київ", "КИЇВ" → the city's point, or null. */
export function findCity(name: string | null | undefined): CityPoint | null {
  if (!name) return null;
  const key = name
    .toLowerCase()
    .split(/[,(]/)[0]
    .replace(/^(м|с|смт)\.\s*/, "")
    .replace(/[’ʼ`]/g, "'")
    .trim();
  return CITIES[key] ?? null;
}
