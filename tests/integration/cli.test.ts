import { describe, expect, test } from "bun:test";
import type { Config } from "../../src/types/Config.ts";
import { ejecutarCli } from "../helpers/cli.ts";
import { ciudad, config } from "../helpers/fixtures.ts";

const ottawa = ciudad({ id: 1 });
const madrid = ciudad({
  id: 2,
  name: "Madrid",
  latitude: 40.4,
  longitude: -3.7,
  admin1: "Madrid",
  country: "España",
});

function leerConfig(crudo: string | null): Config | null {
  if (crudo === null) return null;
  return JSON.parse(crudo) as Config;
}

// Cada línea es una respuesta a una pregunta de la app. Tras cada acción el
// loop principal pide "Presiona Enter para continuar" (línea vacía).
describe("CLI (integración, sin red)", () => {
  test("muestra el menú y sale con la opción 9", async () => {
    const resultado = await ejecutarCli(["9"]);

    expect(resultado.codigo).toBe(0);
    expect(resultado.stdout).toContain("WEATHER CLI");
    expect(resultado.stdout).toContain("1. Clima de ciudad default");
    expect(resultado.stdout).toContain("2. Clima de todas las ciudades (0)");
    expect(resultado.stdout).toContain("3. Buscar y agregar ciudad");
    expect(resultado.stdout).toContain("8. Ajustes (°C)");
    expect(resultado.stdout).toContain("9. Salir");
    expect(resultado.stdout).toContain("¡Hasta luego!");
    // No se escribe el archivo si no hubo cambios.
    expect(resultado.archivoFinal).toBeNull();
  });

  test("sale limpiamente cuando stdin se cierra (EOF)", async () => {
    const resultado = await ejecutarCli([]);

    expect(resultado.codigo).toBe(0);
    expect(resultado.stdout).toContain("Entrada cerrada. ¡Hasta luego!");
  });

  test("avisa de una opción inválida y sigue funcionando", async () => {
    const resultado = await ejecutarCli(["7", "", "9"]);

    expect(resultado.codigo).toBe(0);
    expect(resultado.stdout).toContain('Opción "7" no válida. Elige 1-6, 8 o 9.');
  });

  test("lista sin ciudades guardadas", async () => {
    const resultado = await ejecutarCli(["6", "", "9"]);

    expect(resultado.stdout).toContain("No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    expect(resultado.archivoFinal).toBeNull();
  });

  test("lista las ciudades guardadas y marca la default", async () => {
    const previo = config({ cities: [ottawa, madrid], defaultCityId: 2 });

    const resultado = await ejecutarCli(["6", "", "9"], { archivoPrevio: JSON.stringify(previo) });

    expect(resultado.stdout).toContain("1. Ottawa, Ontario, Canadá");
    expect(resultado.stdout).toContain("2. Madrid, Madrid, España [default]");
    // Listar no modifica el archivo.
    expect(leerConfig(resultado.archivoFinal)).toEqual(previo);
  });

  test("elimina la ciudad default y limpia defaultCityId", async () => {
    const previo = config({ cities: [ottawa, madrid], defaultCityId: 1 });

    const resultado = await ejecutarCli(["4", "1", "", "9"], { archivoPrevio: JSON.stringify(previo) });

    const final = leerConfig(resultado.archivoFinal);
    expect(final?.cities).toEqual([madrid]);
    expect(final?.defaultCityId).toBeNull();
    expect(resultado.stdout).toContain("era la default");
  });

  test("establece la ciudad default y la persiste", async () => {
    const previo = config({ cities: [ottawa, madrid], defaultCityId: 1 });

    const resultado = await ejecutarCli(["5", "2", "", "9"], { archivoPrevio: JSON.stringify(previo) });

    const final = leerConfig(resultado.archivoFinal);
    expect(final?.cities).toEqual([ottawa, madrid]);
    expect(final?.defaultCityId).toBe(2);
    expect(resultado.stdout).toContain("es ahora la ciudad default");
  });

  test("cambia la unidad de temperatura y la persiste", async () => {
    const resultado = await ejecutarCli(["8", "s", "", "9"], {
      archivoPrevio: JSON.stringify(config()),
    });

    expect(leerConfig(resultado.archivoFinal)?.unit).toBe("f");
    expect(resultado.stdout).toContain("Unidad cambiada a °F.");
  });

  test("un archivo de configuración corrupto no rompe la app", async () => {
    const resultado = await ejecutarCli(["9"], { archivoPrevio: "{ esto no es json" });

    expect(resultado.codigo).toBe(0);
    expect(resultado.stderr).toContain("Aviso: no se pudo leer");
    expect(resultado.stdout).toContain("WEATHER CLI");
  });

  test("sanea una configuración inválida al volver a escribirla", async () => {
    const archivoInvalido = JSON.stringify({
      cities: [
        { id: 1, name: "Ottawa", latitude: 45.4, longitude: -75.7 },
        { id: "malo", name: "Inválida" },
        { name: "Sin id" },
      ],
      defaultCityId: 999,
      unit: "x",
    });

    const resultado = await ejecutarCli(["5", "1", "", "9"], { archivoPrevio: archivoInvalido });

    expect(leerConfig(resultado.archivoFinal)).toEqual({
      cities: [{ id: 1, name: "Ottawa", latitude: 45.4, longitude: -75.7 }],
      defaultCityId: 1,
      unit: "c",
    });
  });

  test("el menú refleja la cantidad de ciudades y la unidad guardada", async () => {
    const previo = config({ cities: [ottawa, madrid], defaultCityId: 1, unit: "f" });

    const resultado = await ejecutarCli(["9"], { archivoPrevio: JSON.stringify(previo) });

    expect(resultado.stdout).toContain("2. Clima de todas las ciudades (2)");
    expect(resultado.stdout).toContain("8. Ajustes (°F)");
  });

  test("escribe el archivo en JSON legible (2 espacios)", async () => {
    const resultado = await ejecutarCli(["8", "s", "", "9"], {
      archivoPrevio: JSON.stringify(config({ cities: [ottawa], defaultCityId: 1 })),
    });

    expect(resultado.archivoFinal).not.toBeNull();
    expect(resultado.archivoFinal).toContain('\n  "cities"');
    expect(resultado.archivoFinal).toContain('\n  "defaultCityId"');
    expect(resultado.archivoFinal).toContain('\n  "unit"');
  });
});
