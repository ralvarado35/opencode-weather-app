/** Persistencia de preferencias (porción "defaultCityId" + "unit" del archivo). */

import type { Settings } from "../types/Config.ts";
import { configInicial, readConfigFile, writeConfigFile } from "./configFile.ts";

/** Preferencias guardadas (sin ciudad default y en °C si aún no hay archivo). */
export async function loadSettings(): Promise<Settings> {
  const config = (await readConfigFile()) ?? configInicial();
  return { defaultCityId: config.defaultCityId, unit: config.unit };
}

/** Guarda las preferencias, preservando las ciudades del archivo. */
export async function saveSettings(settings: Settings): Promise<void> {
  const config = (await readConfigFile()) ?? configInicial();
  config.defaultCityId = settings.defaultCityId;
  config.unit = settings.unit;
  await writeConfigFile(config);
}
