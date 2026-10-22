/** Ejecuta la CLI real en un subproceso aislado (HOME temporal, stdin scriptado). */

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ_PROYECTO = fileURLToPath(new URL("../..", import.meta.url));

export interface OpcionesCli {
  /** Contenido crudo de ~/.weather-cli.json antes de arrancar la app. */
  archivoPrevio?: string;
  timeoutMs?: number;
}

export interface ResultadoCli {
  codigo: number;
  stdout: string;
  stderr: string;
  /** Contenido crudo del archivo de configuración al terminar (null si no existe). */
  archivoFinal: string | null;
}

/** Arranca `src/index.ts` con las líneas indicadas por stdin y devuelve su salida. */
export async function ejecutarCli(
  lineas: readonly string[],
  opciones: OpcionesCli = {},
): Promise<ResultadoCli> {
  const home = await mkdtemp(join(tmpdir(), "weather-cli-test-"));
  const rutaConfig = join(home, ".weather-cli.json");
  try {
    if (opciones.archivoPrevio !== undefined) {
      await writeFile(rutaConfig, opciones.archivoPrevio, "utf8");
    }

    const proceso = Bun.spawn([process.execPath, "src/index.ts"], {
      cwd: RAIZ_PROYECTO,
      env: { ...process.env, HOME: home, USERPROFILE: home, NO_COLOR: "1" },
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });

    try {
      if (lineas.length > 0) proceso.stdin.write(`${lineas.join("\n")}\n`);
      proceso.stdin.end();
    } catch {
      // El proceso pudo terminar antes (p. ej. con la opción 9); cerrar el pipe falla sin importancia.
    }

    const timeoutMs = opciones.timeoutMs ?? 20_000;
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    const codigo = await Promise.race([
      proceso.exited,
      new Promise<never>((_, rechazar) => {
        temporizador = setTimeout(() => {
          proceso.kill();
          rechazar(new Error(`La CLI no terminó en ${timeoutMs} ms`));
        }, timeoutMs);
      }),
    ]);
    if (temporizador !== undefined) clearTimeout(temporizador);

    const [stdout, stderr] = await Promise.all([
      new Response(proceso.stdout).text(),
      new Response(proceso.stderr).text(),
    ]);
    const archivoFinal = await leerSiExiste(rutaConfig);
    return { codigo, stdout, stderr, archivoFinal };
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

async function leerSiExiste(ruta: string): Promise<string | null> {
  try {
    return await readFile(ruta, "utf8");
  } catch {
    return null;
  }
}
