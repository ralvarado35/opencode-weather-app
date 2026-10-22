/** Captura y validación de las entradas del usuario por consola. */

import { stdin, stdout } from "node:process";
import type { City } from "../types/City.ts";
import type { Config } from "../types/Config.ts";
import { mostrarAviso, mostrarCiudades } from "./output.ts";

/** Se lanza cuando stdin se cierra (EOF): permite salir del loop limpiamente. */
export class EntradaCerradaError extends Error {}

// Lector de líneas propio. Motivo: en Bun, prompt() y readline.question()
// descartan las líneas pendientes cuando stdin no es una TTY.
const colaLineas: string[] = [];
let bufferLineas = "";
let entradaCerrada = false;
let despertar: (() => void) | null = null;

function avisarLector(): void {
  const d = despertar;
  despertar = null;
  if (d !== null) d();
}

stdin.setEncoding("utf8");
stdin.on("data", (chunk: string) => {
  bufferLineas += chunk;
  let indice: number;
  while ((indice = bufferLineas.indexOf("\n")) !== -1) {
    colaLineas.push(bufferLineas.slice(0, indice).replace(/\r$/, ""));
    bufferLineas = bufferLineas.slice(indice + 1);
  }
  avisarLector();
});

function cerrarEntrada(): void {
  // Última línea sin salto de línea final.
  if (bufferLineas !== "") {
    colaLineas.push(bufferLineas.replace(/\r$/, ""));
    bufferLineas = "";
  }
  entradaCerrada = true;
  avisarLector();
}
stdin.on("end", cerrarEntrada);
stdin.on("error", cerrarEntrada);

process.on("SIGINT", () => {
  console.log("\n  ¡Hasta luego! 👋");
  process.exit(0);
});

/** Espera la siguiente línea de stdin; null si la entrada se cerró. */
async function siguienteLinea(): Promise<string | null> {
  for (;;) {
    if (colaLineas.length > 0) return colaLineas.shift() ?? null;
    if (entradaCerrada) return null;
    await new Promise<void>((resolver) => {
      despertar = resolver;
    });
  }
}

/** Escribe un mensaje y devuelve la respuesta (sin el salto de línea). */
export async function ask(mensaje: string): Promise<string> {
  stdout.write(mensaje);
  const linea = await siguienteLinea();
  if (linea === null) {
    stdout.write("\n");
    throw new EntradaCerradaError();
  }
  return linea;
}

/** Pregunta s/n y devuelve la respuesta del usuario. */
export async function confirmar(mensaje: string): Promise<boolean> {
  const respuesta = (await ask(`${mensaje} (s/n): `)).trim().toLowerCase();
  return respuesta === "s" || respuesta === "si" || respuesta === "sí";
}

/** Espera a que el usuario presione Enter. */
export async function pausa(): Promise<void> {
  await ask("\n  Presiona Enter para continuar...");
}

/** Pide elegir una ciudad de la lista por número. null = cancelado o inválido. */
export async function pedirCiudad(config: Config, accion: string): Promise<City | null> {
  if (config.cities.length === 0) {
    mostrarAviso("No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return null;
  }
  mostrarCiudades(config);
  const respuesta = (await ask(`  Número de la ciudad a ${accion} (Enter para cancelar): `)).trim();
  if (respuesta === "") {
    mostrarAviso("Cancelado.");
    return null;
  }
  const city = config.cities[Number(respuesta) - 1];
  if (city === undefined) {
    mostrarAviso(`"${respuesta}" no es un número de ciudad válido.`);
    return null;
  }
  return city;
}
