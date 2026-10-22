/** Acción: obtener el clima actual de una ciudad (default o de todas). */

import type { City } from "../types/City.ts";
import type { Config } from "../types/Config.ts";
import type { Unit } from "../types/Weather.ts";
import { fetchTemperature } from "../api/weather.ts";
import { mostrarAviso } from "../presentation/output.ts";
import { red } from "../utils/colors.ts";
import { formatearTemperatura, mensajeError, nombreCompleto } from "../utils/format.ts";

/** Línea con el clima de una ciudad (resuelve errores de red devolviendo texto). */
async function descripcionClima(city: City, unit: Unit, esDefault: boolean): Promise<string> {
  const marcador = esDefault ? " [default]" : "";
  try {
    const temp = await fetchTemperature(city.latitude, city.longitude, unit);
    return `  ${nombreCompleto(city)}${marcador}: ${formatearTemperatura(temp, unit)}`;
  } catch (err) {
    return `  ${nombreCompleto(city)}${marcador}: ${red(`error al consultar (${mensajeError(err)})`)}`;
  }
}

/** Clima de la ciudad default (opción 1). */
export async function climaCiudadDefault(config: Config): Promise<void> {
  const city = config.cities.find((c) => c.id === config.defaultCityId);
  if (city === undefined) {
    mostrarAviso("No hay ciudad default. Usa la opción 5 para establecerla, o la 3 para agregar ciudades.");
    return;
  }
  console.log(await descripcionClima(city, config.unit, true));
}

/** Clima de todas las ciudades guardadas (opción 2). */
export async function climaTodasLasCiudades(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    mostrarAviso("No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }
  // Promise.all preserva el orden de la lista a la hora de imprimir.
  const lineas = await Promise.all(
    config.cities.map((city) => descripcionClima(city, config.unit, city.id === config.defaultCityId)),
  );
  for (const linea of lineas) console.log(linea);
}
