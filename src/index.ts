// Weather CLI — aplicación de consola del clima basada en OpenMeteo.
//
// Flujo por ciudad:
//   1. Geocoding: nombre → coordenadas (geocoding-api.open-meteo.com, language=es)
//   2. Forecast:  coordenadas → temperatura actual (api.open-meteo.com)
//
// La configuración (ciudades, ciudad default, unidad) persiste en ~/.weather-cli.json.

import type { Config } from "./types/Config.ts";
import { loadCities } from "./storage/citiesStorage.ts";
import { loadSettings } from "./storage/settingsStorage.ts";
import { EntradaCerradaError, pausa } from "./presentation/input.ts";
import { manejarSeleccion } from "./presentation/menu.ts";

/** Carga la configuración persistida: ciudades + preferencias. */
async function cargarConfig(): Promise<Config> {
  return { cities: await loadCities(), ...(await loadSettings()) };
}

async function main(): Promise<void> {
  const config = await cargarConfig();
  let salir = false;
  while (!salir) {
    try {
      salir = await manejarSeleccion(config);
      if (!salir) await pausa();
    } catch (err) {
      if (err instanceof EntradaCerradaError) {
        console.log("\n  Entrada cerrada. ¡Hasta luego!");
        return;
      }
      throw err;
    }
  }
  console.log("\n  ¡Hasta luego! 👋");
}

if (import.meta.main) {
  await main();
  process.exit(0);
}
