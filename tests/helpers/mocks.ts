/** Mocks compartidos para los tests in-process.
 *
 * IMPORTANTE: en Bun, `mock.module()` afecta a todo el proceso de test y filtra
 * entre archivos (comprobado en Bun 1.4.3). Por eso aquí SOLO se mockean dos
 * módulos que ningún test necesita en su versión real in-process:
 *
 *   - presentation/input.ts  (stdin real: se prueba en tests/integration/cli.test.ts)
 *   - storage/configFile.ts  (disco real: se prueba en tests/integration/cli.test.ts)
 *
 * Este archivo debe importarse ANTES de importar dinámicamente acciones, menú
 * o storages (los imports de `src/` en esos tests deben ser `await import(...)`).
 */

import { mock } from "bun:test";
import { fileURLToPath } from "node:url";
import { mostrarAviso, mostrarCiudades } from "../../src/presentation/output.ts";
import type { City } from "../../src/types/City.ts";
import type { Config } from "../../src/types/Config.ts";
import { clonar } from "./fixtures.ts";

const rutaInput = fileURLToPath(new URL("../../src/presentation/input.ts", import.meta.url));
const rutaConfigFile = fileURLToPath(new URL("../../src/storage/configFile.ts", import.meta.url));

// --- Entrada de usuario scriptada -------------------------------------------

const respuestas: string[] = [];

/** Cola de respuestas para las preguntas de presentation/input.ts. */
export const entrada = {
  /** Añade respuestas en orden (una por cada pregunta que hará la app). */
  encolar(...lineas: string[]): void {
    respuestas.push(...lineas);
  },
  /** Vacía la cola (llamar en beforeEach). */
  reiniciar(): void {
    respuestas.length = 0;
  },
  /** Respuestas que quedaron sin consumir (debería ser 0 al final de cada test). */
  quedan(): number {
    return respuestas.length;
  },
};

function siguienteLinea(pregunta: string): string {
  const linea = respuestas.shift();
  if (linea === undefined) {
    throw new Error(`Entrada scriptada agotada al responder: "${pregunta.trim()}"`);
  }
  return linea;
}

mock.module(rutaInput, () => ({
  EntradaCerradaError: class EntradaCerradaError extends Error {},
  ask: async (pregunta: string): Promise<string> => siguienteLinea(pregunta),
  confirmar: async (pregunta: string): Promise<boolean> => {
    const respuesta = siguienteLinea(pregunta).trim().toLowerCase();
    return respuesta === "s" || respuesta === "si" || respuesta === "sí";
  },
  pausa: async (): Promise<void> => {},
  pedirCiudad: async (config: Config, accion: string): Promise<City | null> => {
    if (config.cities.length === 0) {
      mostrarAviso("No hay ciudades guardadas. Usa la opción 3 para agregar una.");
      return null;
    }
    mostrarCiudades(config);
    const respuesta = siguienteLinea(`  Número de la ciudad a ${accion} (Enter para cancelar): `).trim();
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
  },
}));

// --- Archivo de configuración en memoria ------------------------------------

interface EstadoConfig {
  archivo: Config | null;
  escrituras: Config[];
}

const estado: EstadoConfig = { archivo: null, escrituras: [] };

mock.module(rutaConfigFile, () => ({
  configInicial: (): Config => ({ cities: [], defaultCityId: null, unit: "c" }),
  readConfigFile: async (): Promise<Config | null> => clonar(estado.archivo),
  writeConfigFile: async (config: Config): Promise<void> => {
    estado.archivo = clonar(config);
    estado.escrituras.push(clonar(config));
  },
}));

/** Archivo de configuración en memoria + registro de escrituras. */
export const almacen = {
  /** Deja el "archivo" con el contenido indicado (null = archivo ausente). */
  sembrar(config: Config | null): void {
    estado.archivo = config === null ? null : clonar(config);
    estado.escrituras.length = 0;
  },
  /** Archivo ausente y sin escrituras (llamar en beforeEach). */
  reiniciar(): void {
    this.sembrar(null);
  },
  get archivo(): Config | null {
    return estado.archivo;
  },
  get escrituras(): readonly Config[] {
    return estado.escrituras;
  },
};
