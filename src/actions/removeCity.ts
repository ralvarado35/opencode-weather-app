/** Acción: eliminar una ciudad de la lista (opción 4). */

import type { Config } from "../types/Config.ts";
import { pedirCiudad } from "../presentation/input.ts";
import { mostrarExito } from "../presentation/output.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import { nombreCompleto } from "../utils/format.ts";

export async function eliminarCiudad(config: Config): Promise<void> {
  const city = await pedirCiudad(config, "eliminar");
  if (city === null) return;
  const indice = config.cities.indexOf(city);
  if (indice === -1) return; // no debería ocurrir
  config.cities.splice(indice, 1);
  let aviso = "";
  const eraDefault = config.defaultCityId === city.id;
  if (eraDefault) {
    config.defaultCityId = null;
    aviso = " (era la default; usa la opción 5 para establecer otra)";
  }
  await saveCities(config.cities);
  if (eraDefault) {
    await saveSettings({ defaultCityId: config.defaultCityId, unit: config.unit });
  }
  mostrarExito(`${nombreCompleto(city)} eliminada${aviso}.`);
}
