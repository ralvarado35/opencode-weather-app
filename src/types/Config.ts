import type { City } from "./City.ts";
import type { Unit } from "./Weather.ts";

/** Configuración persistente del usuario (contenido de ~/.weather-cli.json). */
export interface Config {
  cities: City[];
  defaultCityId: number | null;
  unit: Unit;
}

/** Preferencias del usuario (porción de Config que no son ciudades). */
export interface Settings {
  defaultCityId: number | null;
  unit: Unit;
}
