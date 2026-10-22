/** Unidad de temperatura preferida por el usuario. */
export type Unit = "c" | "f";

/** Respuesta del API de forecast (solo los campos que usamos). */
export interface ForecastResponse {
  current?: {
    temperature_2m?: number;
  };
}
