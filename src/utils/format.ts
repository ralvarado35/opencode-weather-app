/** Formateadores de datos para mostrar al usuario. */

import type { City } from "../types/City.ts";
import type { Unit } from "../types/Weather.ts";

/** Símbolo de la unidad de temperatura ("°C" / "°F"). */
export function simboloUnidad(unit: Unit): string {
  return unit === "c" ? "°C" : "°F";
}

/** "Ottawa, Ontario, Canadá" — omite los campos que no existan. */
export function nombreCompleto(city: City): string {
  const partes = [city.name, city.admin1, city.country].filter(
    (parte): parte is string => typeof parte === "string" && parte.length > 0,
  );
  return partes.join(", ");
}

/** "23.4 °C" o "sin datos" cuando el servicio no devolvió temperatura. */
export function formatearTemperatura(temperatura: number | null, unit: Unit): string {
  return temperatura === null ? "sin datos" : `${temperatura.toFixed(1)} ${simboloUnidad(unit)}`;
}

/** Convierte un error desconocido en un mensaje legible. */
export function mensajeError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
