import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { capturarConsola, type CapturaConsola } from "../helpers/console.ts";
import { ciudad, config } from "../helpers/fixtures.ts";
import { almacen, entrada } from "../helpers/mocks.ts";

const { manejarSeleccion, mostrarMenu } = await import("../../src/presentation/menu.ts");

let consola: CapturaConsola;

beforeEach(() => {
  consola = capturarConsola();
  entrada.reiniciar();
  almacen.reiniciar();
});

afterEach(() => {
  consola.restaurar();
  expect(entrada.quedan()).toBe(0);
});

describe("mostrarMenu", () => {
  test("dibuja el título y todas las opciones con sus etiquetas dinámicas", () => {
    const cfg = config({ cities: [ciudad({ id: 1 }), ciudad({ id: 2 })], unit: "f" });

    mostrarMenu(cfg);

    const salida = consola.logs.join("\n");
    expect(salida).toContain("WEATHER CLI");
    expect(salida).toContain("═".repeat(40));
    expect(salida).toContain("1. Clima de ciudad default");
    expect(salida).toContain("2. Clima de todas las ciudades (2)");
    expect(salida).toContain("3. Buscar y agregar ciudad");
    expect(salida).toContain("4. Eliminar ciudad");
    expect(salida).toContain("5. Establecer ciudad default");
    expect(salida).toContain("6. Listar ciudades guardadas");
    expect(salida).toContain("8. Ajustes (°F)");
    expect(salida).toContain("9. Salir");
    expect(salida).not.toContain("7.");
  });

  test("refleja la unidad celsius por defecto", () => {
    mostrarMenu(config());

    expect(consola.logs.join("\n")).toContain("8. Ajustes (°C)");
  });
});

describe("manejarSeleccion", () => {
  test("sale con la opción 9 y devuelve true", async () => {
    entrada.encolar("9");

    expect(await manejarSeleccion(config())).toBe(true);
  });

  test("acepta espacios alrededor de la opción", async () => {
    entrada.encolar("  9  ");

    expect(await manejarSeleccion(config())).toBe(true);
  });

  test("avisa de las opciones inválidas y devuelve false", async () => {
    entrada.encolar("7");

    expect(await manejarSeleccion(config())).toBe(false);
    expect(consola.logs.join("\n")).toContain('Opción "7" no válida. Elige 1-6, 8 o 9.');
  });

  test("despacha la opción 6 (listar) con las ciudades guardadas", async () => {
    entrada.encolar("6");
    const cfg = config({ cities: [ciudad({ id: 1 })], defaultCityId: 1 });

    expect(await manejarSeleccion(cfg)).toBe(false);

    expect(consola.logs.join("\n")).toContain("1. Ottawa, Ontario, Canadá [default]");
  });

  test("despacha la opción 8 (ajustes) y persiste el cambio de unidad", async () => {
    entrada.encolar("8", "s");
    const cfg = config();
    almacen.sembrar(cfg);

    expect(await manejarSeleccion(cfg)).toBe(false);

    expect(cfg.unit).toBe("f");
    expect(almacen.archivo?.unit).toBe("f");
  });
});
