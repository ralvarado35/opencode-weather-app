/** Acción: ajustes de la app (opción 8) — unidad de temperatura. */

import type { Config } from "../types/Config.ts";
import type { Unit } from "../types/Weather.ts";
import { confirmar } from "../presentation/input.ts";
import { mostrarAviso, mostrarExito, mostrarMensaje } from "../presentation/output.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import { simboloUnidad } from "../utils/format.ts";

export async function ajustes(config: Config): Promise<void> {
  const otra: Unit = config.unit === "c" ? "f" : "c";
  mostrarMensaje(`Unidad de temperatura actual: ${simboloUnidad(config.unit)}`);
  if (!(await confirmar(`  ¿Cambiar a ${simboloUnidad(otra)}?`))) {
    mostrarAviso("Sin cambios.");
    return;
  }
  config.unit = otra;
  await saveSettings({ defaultCityId: config.defaultCityId, unit: config.unit });
  mostrarExito(`Unidad cambiada a ${simboloUnidad(otra)}.`);
}
