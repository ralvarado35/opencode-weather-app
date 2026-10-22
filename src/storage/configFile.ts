/** Acceso al archivo de configuración (~/.weather-cli.json).
 *
 * Módulo interno compartido por citiesStorage y settingsStorage: lee, valida
 * y escribe el archivo completo; los storages de dominio trabajan por porciones.
 */

import type { City } from "../types/City.ts";
import type { Config } from "../types/Config.ts";
import { CONFIG_PATH } from "../utils/constants.ts";

/** Configuración inicial (archivo ausente o ilegible). */
export function configInicial(): Config {
  return { cities: [], defaultCityId: null, unit: "c" };
}

/** Último contenido leído o escrito (evita releer el archivo en cada guardado). */
let cache: Config | null | undefined;

function esCiudad(valor: unknown): valor is City {
  if (typeof valor !== "object" || valor === null) return false;
  const c = valor as Record<string, unknown>;
  return (
    typeof c.id === "number" &&
    typeof c.name === "string" &&
    typeof c.latitude === "number" &&
    typeof c.longitude === "number"
  );
}

/** Valida y normaliza el contenido del archivo de configuración. */
function normalizarConfig(datos: unknown): Config {
  const config = configInicial();
  if (typeof datos !== "object" || datos === null) return config;
  const d = datos as Record<string, unknown>;
  if (Array.isArray(d.cities)) {
    config.cities = d.cities.filter(esCiudad).map((c) => ({ ...c }));
  }
  const idDefault = d.defaultCityId;
  if (typeof idDefault === "number" && config.cities.some((c) => c.id === idDefault)) {
    config.defaultCityId = idDefault;
  }
  if (d.unit === "f") config.unit = "f";
  return config;
}

/** Lee y valida el archivo completo (null si no existe o está ilegible). */
export async function readConfigFile(): Promise<Config | null> {
  if (cache !== undefined) return cache;
  const archivo = Bun.file(CONFIG_PATH);
  if (!(await archivo.exists())) {
    cache = null;
    return null;
  }
  try {
    cache = normalizarConfig(await archivo.json());
  } catch {
    console.error(`Aviso: no se pudo leer ${CONFIG_PATH}. Se inicia con configuración vacía.`);
    cache = null;
  }
  return cache;
}

/** Escribe la configuración completa en el archivo. */
export async function writeConfigFile(config: Config): Promise<void> {
  await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2));
  cache = config;
}
