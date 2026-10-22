/** Acción: buscar una ciudad por nombre y agregarla a la lista (opción 3). */

import type { City } from "../types/City.ts";
import type { Config } from "../types/Config.ts";
import { geocode } from "../api/geocoding.ts";
import { ask, confirmar } from "../presentation/input.ts";
import { mostrarAviso, mostrarError, mostrarExito, mostrarMensaje } from "../presentation/output.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import { mensajeError, nombreCompleto } from "../utils/format.ts";

export async function agregarCiudad(config: Config): Promise<void> {
  const nombre = (await ask("  Ciudad a buscar: ")).trim();
  if (nombre === "") {
    mostrarAviso("No ingresaste ningún nombre.");
    return;
  }
  let resultado: City | null;
  try {
    resultado = await geocode(nombre);
  } catch (err) {
    mostrarError(`Error al buscar la ciudad: ${mensajeError(err)}`);
    return;
  }
  if (resultado === null) {
    mostrarAviso(`No se encontró ninguna ciudad llamada "${nombre}".`);
    return;
  }
  // Se copian solo los campos conocidos: el resto del payload de geocoding no se persiste.
  const ciudad: City = {
    id: resultado.id,
    name: resultado.name,
    latitude: resultado.latitude,
    longitude: resultado.longitude,
    admin1: resultado.admin1,
    country: resultado.country,
  };
  if (config.cities.some((c) => c.id === ciudad.id)) {
    mostrarAviso(`Esa ciudad ya está en tu lista: ${nombreCompleto(ciudad)}`);
    return;
  }
  mostrarMensaje(
    `Encontrada: ${nombreCompleto(ciudad)} (lat ${ciudad.latitude.toFixed(2)}, lon ${ciudad.longitude.toFixed(2)})`,
  );
  if (!(await confirmar("  ¿Agregar a tu lista?"))) {
    mostrarAviso("No se agregó.");
    return;
  }
  config.cities.push(ciudad);
  let aviso = "";
  const esPrimera = config.defaultCityId === null;
  if (esPrimera) {
    config.defaultCityId = ciudad.id;
    aviso = " y establecida como default";
  }
  await saveCities(config.cities);
  if (esPrimera) {
    await saveSettings({ defaultCityId: config.defaultCityId, unit: config.unit });
  }
  mostrarExito(`${nombreCompleto(ciudad)} agregada${aviso}.`);
}
