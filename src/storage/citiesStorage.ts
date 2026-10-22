/** Persistencia de las ciudades guardadas (porción "cities" del archivo). */

import type { City } from "../types/City.ts";
import { configInicial, readConfigFile, writeConfigFile } from "./configFile.ts";

/** Ciudades guardadas (lista vacía si aún no hay archivo). */
export async function loadCities(): Promise<City[]> {
  return (await readConfigFile())?.cities ?? [];
}

/** Guarda la lista completa de ciudades, preservando el resto del archivo. */
export async function saveCities(cities: City[]): Promise<void> {
  const config = (await readConfigFile()) ?? configInicial();
  config.cities = cities;
  await writeConfigFile(config);
}
