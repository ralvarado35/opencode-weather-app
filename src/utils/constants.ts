/** Constantes generales de la app. */

import { homedir } from "node:os";
import { join } from "node:path";

/** Título mostrado en el menú. */
export const APP_NAME = "WEATHER CLI";

/** Línea decorativa del menú. */
export const LINEA = "═".repeat(40);

/** Ruta del archivo de configuración persistente. */
export const CONFIG_PATH = join(homedir(), ".weather-cli.json");

/** URL del API de geocoding de OpenMeteo. */
export const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

/** URL del API de forecast de OpenMeteo. */
export const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
