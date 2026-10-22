/** Integración con el API de geocoding de OpenMeteo. */

import type { City } from "../types/City.ts";
import { GEOCODING_URL } from "../utils/constants.ts";

/** Busca una ciudad por nombre (español, máximo 1 resultado). null si no hay coincidencias. */
export async function geocode(nombre: string): Promise<City | null> {
  const params = new URLSearchParams({ name: nombre, count: "1", language: "es", format: "json" });
  const res = await fetch(`${GEOCODING_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`el servicio de geocoding respondió ${res.status}`);
  const data = (await res.json()) as { results?: City[] };
  return data.results?.[0] ?? null;
}
