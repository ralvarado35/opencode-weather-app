/** Renderizado del menú principal y despacho de opciones. */

import type { Config } from "../types/Config.ts";
import type { MenuOption } from "../types/MenuOption.ts";
import { agregarCiudad } from "../actions/addCity.ts";
import { eliminarCiudad } from "../actions/removeCity.ts";
import { establecerCiudadDefault } from "../actions/setDefaultCity.ts";
import { ajustes } from "../actions/settings.ts";
import { climaCiudadDefault, climaTodasLasCiudades } from "../actions/getWeather.ts";
import { listarCiudades } from "../actions/listCities.ts";
import { ask } from "./input.ts";
import { mostrarAviso } from "./output.ts";
import { bold, cyan } from "../utils/colors.ts";
import { APP_NAME, LINEA } from "../utils/constants.ts";
import { simboloUnidad } from "../utils/format.ts";

/** Opción que termina el programa (run nunca se ejecuta: salir corta antes). */
const OPCION_SALIR: MenuOption = { key: "9", label: () => "Salir", run: async () => {} };

/** Opciones del menú, en el orden en que se muestran. */
const MENU: MenuOption[] = [
  { key: "1", label: () => "Clima de ciudad default", run: climaCiudadDefault },
  { key: "2", label: (config) => `Clima de todas las ciudades (${config.cities.length})`, run: climaTodasLasCiudades },
  { key: "3", label: () => "Buscar y agregar ciudad", run: agregarCiudad },
  { key: "4", label: () => "Eliminar ciudad", run: eliminarCiudad },
  { key: "5", label: () => "Establecer ciudad default", run: establecerCiudadDefault },
  { key: "6", label: () => "Listar ciudades guardadas", run: listarCiudades },
  { key: "8", label: (config) => `Ajustes (${simboloUnidad(config.unit)})`, run: ajustes },
  OPCION_SALIR,
];

/** Dibuja el menú completo. */
export function mostrarMenu(config: Config): void {
  console.log("");
  console.log(LINEA);
  console.log(cyan(bold(`         ${APP_NAME}`)));
  console.log(LINEA);
  for (const opcion of MENU) {
    console.log(`  ${opcion.key}. ${opcion.label(config)}`);
  }
  console.log(LINEA);
}

/** Muestra el menú, lee la selección del usuario y ejecuta la acción elegida.
 * Devuelve true cuando el usuario eligió salir. */
export async function manejarSeleccion(config: Config): Promise<boolean> {
  mostrarMenu(config);
  const seleccion = (await ask("  Selecciona una opción: ")).trim();
  console.log("");
  const opcion = MENU.find((o) => o.key === seleccion);
  if (opcion === undefined) {
    mostrarAviso(`Opción "${seleccion}" no válida. Elige 1-6, 8 o 9.`);
    return false;
  }
  if (opcion === OPCION_SALIR) return true;
  await opcion.run(config);
  return false;
}
