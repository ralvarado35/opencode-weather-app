import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { capturarConsola, type CapturaConsola } from "../helpers/console.ts";
import { ciudad, config } from "../helpers/fixtures.ts";
import { almacen, entrada } from "../helpers/mocks.ts";

const { eliminarCiudad } = await import("../../src/actions/removeCity.ts");

const ottawa = ciudad({ id: 1 });
const madrid = ciudad({ id: 2, name: "Madrid", latitude: 40.4, longitude: -3.7, admin1: "Madrid", country: "España" });

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

describe("eliminarCiudad", () => {
  test("avisa cuando no hay ciudades guardadas", async () => {
    const cfg = config();

    await eliminarCiudad(cfg);

    expect(consola.logs.join("\n")).toContain("No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    expect(almacen.escrituras).toHaveLength(0);
  });

  test("cancela con Enter sin modificar la lista", async () => {
    entrada.encolar("");
    const cfg = config({ cities: [ottawa, madrid], defaultCityId: 1 });
    almacen.sembrar(cfg);

    await eliminarCiudad(cfg);

    expect(consola.logs.join("\n")).toContain("Cancelado.");
    expect(cfg.cities).toHaveLength(2);
    expect(almacen.escrituras).toHaveLength(0);
  });

  test("rechaza números de ciudad inválidos", async () => {
    entrada.encolar("9");
    const cfg = config({ cities: [ottawa, madrid], defaultCityId: 1 });
    almacen.sembrar(cfg);

    await eliminarCiudad(cfg);

    expect(consola.logs.join("\n")).toContain('"9" no es un número de ciudad válido.');
    expect(cfg.cities).toHaveLength(2);
    expect(almacen.escrituras).toHaveLength(0);
  });

  test("elimina la ciudad elegida sin tocar el default", async () => {
    entrada.encolar("2");
    const cfg = config({ cities: [ottawa, madrid], defaultCityId: 1 });
    almacen.sembrar(cfg);

    await eliminarCiudad(cfg);

    expect(cfg.cities).toEqual([ottawa]);
    expect(cfg.defaultCityId).toBe(1);
    expect(almacen.archivo).toEqual(config({ cities: [ottawa], defaultCityId: 1 }));
    expect(almacen.escrituras).toHaveLength(1);
    expect(consola.logs.join("\n")).toContain("Madrid, Madrid, España eliminada.");
  });

  test("limpia el default al eliminar la ciudad default", async () => {
    entrada.encolar("1");
    const cfg = config({ cities: [ottawa, madrid], defaultCityId: 1 });
    almacen.sembrar(cfg);

    await eliminarCiudad(cfg);

    expect(cfg.defaultCityId).toBeNull();
    expect(almacen.archivo).toEqual(config({ cities: [madrid], defaultCityId: null }));
    // saveCities + saveSettings (había que limpiar el default)
    expect(almacen.escrituras).toHaveLength(2);
    expect(consola.logs.join("\n")).toContain("era la default");
  });
});
