/** Captura de consola para verificar la salida al usuario. */

import { spyOn } from "bun:test";

export interface CapturaConsola {
  /** Líneas impresas con console.log, en orden. */
  logs: string[];
  /** Líneas impresas con console.error, en orden. */
  errores: string[];
  /** Deshace los espías (llamar en afterEach). */
  restaurar(): void;
}

function formatear(args: unknown[]): string {
  return args.map((arg) => (typeof arg === "string" ? arg : String(arg))).join(" ");
}

/** Empieza a capturar console.log y console.error. */
export function capturarConsola(): CapturaConsola {
  const logs: string[] = [];
  const errores: string[] = [];
  const espiaLog = spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    logs.push(formatear(args));
  });
  const espiaError = spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    errores.push(formatear(args));
  });
  return {
    logs,
    errores,
    restaurar(): void {
      espiaLog.mockRestore();
      espiaError.mockRestore();
    },
  };
}
