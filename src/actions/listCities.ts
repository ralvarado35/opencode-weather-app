/** Acción: listar todas las ciudades guardadas (opción 6). */

import type { Config } from "../types/Config.ts";
import { mostrarAviso, mostrarCiudades } from "../presentation/output.ts";

export async function listarCiudades(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    mostrarAviso("No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }
  mostrarCiudades(config);
}
