/** Acción: establecer la ciudad por defecto (opción 5). */

import type { Config } from "../types/Config.ts";
import { pedirCiudad } from "../presentation/input.ts";
import { mostrarExito } from "../presentation/output.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import { nombreCompleto } from "../utils/format.ts";

export async function establecerCiudadDefault(config: Config): Promise<void> {
  const city = await pedirCiudad(config, "establecer como default");
  if (city === null) return;
  config.defaultCityId = city.id;
  await saveSettings({ defaultCityId: config.defaultCityId, unit: config.unit });
  mostrarExito(`${nombreCompleto(city)} es ahora la ciudad default.`);
}
