/** Fábricas de datos de prueba para ciudades y configuración. */

import type { City } from "../../src/types/City.ts";
import type { Config } from "../../src/types/Config.ts";

/** Ciudad completa (Ottawa por defecto); sobreescribe los campos indicados. */
export function ciudad(parcial: Partial<City> = {}): City {
  return {
    id: 1,
    name: "Ottawa",
    latitude: 45.41117,
    longitude: -75.69812,
    admin1: "Ontario",
    country: "Canadá",
    ...parcial,
  };
}

/** Configuración vacía (°C, sin default); sobreescribe los campos indicados. */
export function config(parcial: Partial<Config> = {}): Config {
  return {
    cities: [],
    defaultCityId: null,
    unit: "c",
    ...parcial,
  };
}

/** Copia profunda para aislar el estado entre tests. */
export function clonar<T>(valor: T): T {
  return structuredClone(valor);
}
