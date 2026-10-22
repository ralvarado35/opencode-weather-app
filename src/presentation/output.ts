/** Funciones para mostrar mensajes al usuario por consola. */

import type { Config } from "../types/Config.ts";
import { green, red, yellow } from "../utils/colors.ts";
import { nombreCompleto } from "../utils/format.ts";

/** Mensaje informativo normal. */
export function mostrarMensaje(mensaje: string): void {
  console.log(`  ${mensaje}`);
}

/** Aviso o advertencia (en amarillo). */
export function mostrarAviso(mensaje: string): void {
  console.log(`  ${yellow(mensaje)}`);
}

/** Mensaje de éxito (✔ en verde). */
export function mostrarExito(mensaje: string): void {
  console.log(`  ${green(`✔ ${mensaje}`)}`);
}

/** Mensaje de error (✖ en rojo). */
export function mostrarError(mensaje: string): void {
  console.log(`  ${red(`✖ ${mensaje}`)}`);
}

/** Imprime la lista numerada de ciudades guardadas, marcando la default. */
export function mostrarCiudades(config: Config): void {
  config.cities.forEach((city, i) => {
    const marcador = city.id === config.defaultCityId ? " [default]" : "";
    console.log(`  ${i + 1}. ${nombreCompleto(city)}${marcador}`);
  });
}
