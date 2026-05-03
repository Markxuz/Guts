import {
  getRegions,
  getProvincesByRegion,
  getCitiesAndMunsByProvince,
  getBarangaysByCityOrMun,
} from "latest-ph-address-thanks-to-anehan";
import zipcodes from "zipcodes-ph";

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeMatch(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/^city of\s+/i, "")
    .replace(/\bgen\.?\b/gi, "general")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toLocationVariants(value) {
  const normalized = normalizeMatch(value);
  if (!normalized) {
    return [];
  }

  const variants = new Set([normalized]);
  variants.add(normalized.replace(/\bcity\b/g, "").trim().replace(/\s+/g, " "));
  variants.add(normalized.replace(/\bmunicipality\b/g, "").trim().replace(/\s+/g, " "));
  variants.add(normalized.replace(/\bcity\b|\bmunicipality\b/g, "").trim().replace(/\s+/g, " "));

  return Array.from(variants).filter(Boolean);
}

function formatCityLabel(name) {
  const normalized = normalizeText(name);

  if (normalized.toLowerCase().startsWith("city of ")) {
    return normalized.replace(/^city of\s+/i, "");
  }

  if (normalized === "Gen. Mariano Alvarez") {
    return "General Mariano Alvarez";
  }

  return normalized;
}

export function getRegionOptions() {
  return getRegions().map((item) => ({
    value: item.psgc,
    label: item.name,
  }));
}

export function getProvinceOptions(regionCode) {
  if (!regionCode) {
    return [];
  }

  const provinces = getProvincesByRegion(regionCode);
  if (typeof provinces === "string") {
    return [{ value: provinces, label: provinces }];
  }

  return provinces.map((item) => ({
    value: item.psgc,
    label: item.name,
  }));
}

export function getCityOptions(regionCode, provinceCode) {
  if (!regionCode) {
    return [];
  }

  const cities = provinceCode === "-NO PROVINCE-"
    ? getCitiesAndMunsByProvince("-NO PROVINCE-", regionCode)
    : getCitiesAndMunsByProvince(provinceCode);

  return cities.map((item) => ({
    value: item.psgc,
    label: formatCityLabel(item.name),
  }));
}

export function getBarangayOptions(cityCode) {
  if (!cityCode || cityCode === "-NO PROVINCE-") {
    return [];
  }

  return getBarangaysByCityOrMun(cityCode).map((item) => ({
    value: item.psgc,
    label: item.name,
  }));
}

export function getRegionLabel(regionCode) {
  const match = getRegions().find((item) => item.psgc === regionCode);
  return match?.name || regionCode || "";
}

export function findRegionCodeByLabel(regionLabel) {
  const normalized = normalizeMatch(regionLabel);
  if (!normalized) return "";

  const match = getRegions().find((item) => normalizeMatch(item.name) === normalized);
  return match?.psgc || "";
}

export function getProvinceLabel(regionCode, provinceCode) {
  if (!regionCode || !provinceCode) {
    return provinceCode || "";
  }

  const provinces = getProvincesByRegion(regionCode);
  if (typeof provinces === "string") {
    return provinces;
  }

  const match = provinces.find((item) => item.psgc === provinceCode);
  return match?.name || provinceCode || "";
}

export function findProvinceCodeByName(regionCode, provinceName) {
  if (!regionCode) return "";

  const normalized = normalizeMatch(provinceName);
  if (!normalized) return "";

  const provinces = getProvinceOptions(regionCode);
  const match = provinces.find((item) => normalizeMatch(item.label) === normalized);
  return match?.value || "";
}

export function getCityLabel(regionCode, provinceCode, cityCode) {
  if (!regionCode || !cityCode) {
    return cityCode || "";
  }

  const cities = provinceCode === "-NO PROVINCE-"
    ? getCitiesAndMunsByProvince("-NO PROVINCE-", regionCode)
    : getCitiesAndMunsByProvince(provinceCode);

  const match = cities.find((item) => item.psgc === cityCode);
  return match ? formatCityLabel(match.name) : cityCode || "";
}

export function findCityCodeByName(regionCode, provinceCode, cityName) {
  if (!regionCode || !provinceCode) return "";

  const normalized = normalizeMatch(cityName);
  if (!normalized) return "";

  const cities = getCityOptions(regionCode, provinceCode);
  const match = cities.find((item) => normalizeMatch(item.label) === normalized);
  return match?.value || "";
}

export function getBarangayLabel(cityCode, barangayCode) {
  if (!cityCode || !barangayCode) {
    return barangayCode || "";
  }

  const barangays = getBarangaysByCityOrMun(cityCode);
  const match = barangays.find((item) => item.psgc === barangayCode);
  return match?.name || barangayCode || "";
}

export function findBarangayCodeByName(cityCode, barangayName) {
  if (!cityCode) return "";

  const normalized = normalizeMatch(barangayName);
  if (!normalized) return "";

  const barangays = getBarangayOptions(cityCode);
  const match = barangays.find((item) => normalizeMatch(item.label) === normalized);
  return match?.value || "";
}

// ITO YUNG PANGUNAHING BINAGO NATIN PARA GUMANA ANG AUTO-FILL
export function getZipCodeByAddressCodes(regionCode, provinceCode, cityCode) {
  if (!regionCode || !provinceCode || !cityCode) {
    return "";
  }

  const cityLabel = getCityLabel(regionCode, provinceCode, cityCode);
  
  if (!cityLabel) {
    return "";
  }

  // Step 1: Subukan agad ang diretsong city label gamit ang built-in reverse function
  let zip = zipcodes.reverse(cityLabel);
  if (zip) {
    return String(zip);
  }

  // Step 2: Kung hindi nahanap, gagamit tayo ng variants para sumakto sa database nila
  const cityVariants = toLocationVariants(cityLabel);
  
  // Custom rules para sa mga lugar sa Cavite tulad ng nasa screenshot mo
  if (cityLabel === "General Mariano Alvarez") {
    cityVariants.push("Gen. Mariano Alvarez");
    cityVariants.push("GMA");
  } else if (cityLabel === "General Trias") {
    cityVariants.push("Gen. Trias");
  }

  for (const variant of cityVariants) {
    zip = zipcodes.reverse(variant);
    if (zip) {
      return String(zip);
    }
  }

  return "";
}