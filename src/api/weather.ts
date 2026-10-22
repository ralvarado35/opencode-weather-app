/** Integración con el API de forecast de OpenMeteo. */

import type { ForecastResponse, Unit } from "../types/Weather.ts";
import { FORECAST_URL } from "../utils/constants.ts";

/** Obtiene la temperatura actual para unas coordenadas, en °C o °F. */
export async function fetchTemperature(
  latitude: number,
  longitude: number,
  unit: Unit,
): Promise<number | null> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m",
  });
  if (unit === "f") params.set("temperature_unit", "fahrenheit");
  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`el servicio de forecast respondió ${res.status}`);
  const data = (await res.json()) as ForecastResponse;
  return data.current?.temperature_2m ?? null;
}
