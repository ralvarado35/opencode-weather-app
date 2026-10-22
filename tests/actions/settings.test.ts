import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { capturarConsola, type CapturaConsola } from "../helpers/console.ts";
import { config } from "../helpers/fixtures.ts";
import { almacen, entrada } from "../helpers/mocks.ts";

const { ajustes } = await import("../../src/actions/settings.ts");

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

describe("ajustes", () => {
  test("muestra la unidad actual y no cambia nada si se rechaza", async () => {
    entrada.encolar("n");
    const cfg = config({ unit: "c" });
    almacen.sembrar(cfg);

    await ajustes(cfg);

    expect(consola.logs.join("\n")).toContain("Unidad de temperatura actual: °C");
    expect(consola.logs.join("\n")).toContain("Sin cambios.");
    expect(cfg.unit).toBe("c");
    expect(almacen.escrituras).toHaveLength(0);
  });

  test("cambia de °C a °F y lo persiste", async () => {
    entrada.encolar("s");
    const cfg = config({ unit: "c" });
    almacen.sembrar(cfg);

    await ajustes(cfg);

    expect(cfg.unit).toBe("f");
    expect(almacen.archivo?.unit).toBe("f");
    expect(almacen.escrituras).toHaveLength(1);
    expect(consola.logs.join("\n")).toContain("Unidad cambiada a °F.");
  });

  test("cambia de °F a °C y lo persiste", async () => {
    entrada.encolar("sí");
    const cfg = config({ unit: "f" });
    almacen.sembrar(cfg);

    await ajustes(cfg);

    expect(cfg.unit).toBe("c");
    expect(almacen.archivo?.unit).toBe("c");
    expect(consola.logs.join("\n")).toContain("Unidad cambiada a °C.");
  });
});
