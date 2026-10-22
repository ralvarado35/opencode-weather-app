/** Colores ANSI para la salida por consola.
 *
 * Se desactivan automáticamente cuando la salida no es una TTY (por ejemplo,
 * al redirigir a un archivo) o si la variable de entorno NO_COLOR está definida
 * con un valor no vacío.
 */

import process from "node:process";

const RESET = "\x1b[0m";

const coloresActivos = !process.env.NO_COLOR && Boolean(process.stdout.isTTY);

/** Envuelve el texto con un código ANSI (o lo devuelve tal cual si no hay color). */
function pintar(codigo: string, texto: string): string {
  return coloresActivos ? `${codigo}${texto}${RESET}` : texto;
}

/** Texto en cian (títulos). */
export function cyan(texto: string): string {
  return pintar("\x1b[36m", texto);
}

/** Texto en verde (mensajes de éxito). */
export function green(texto: string): string {
  return pintar("\x1b[32m", texto);
}

/** Texto en rojo (errores). */
export function red(texto: string): string {
  return pintar("\x1b[31m", texto);
}

/** Texto en amarillo (avisos). */
export function yellow(texto: string): string {
  return pintar("\x1b[33m", texto);
}

/** Texto en negrita. */
export function bold(texto: string): string {
  return pintar("\x1b[1m", texto);
}
