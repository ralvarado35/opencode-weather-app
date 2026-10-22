import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { capturarConsola, type CapturaConsola } from "../helpers/console.ts";
import { ciudad, config } from "../helpers/fixtures.ts";
import { almacen, entrada } from "../helpers/mocks.ts";

const { establecerCiudadDefault } = await import("../../src/actions/setDefaultCity.ts");

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

describe("establecerCiudadDefault", () => {
  test("avisa cuando no hay ciudades guardadas", async () => {
    await establecerCiudadDefault(config());

    expect(consola.logs.join("\n")).toContain("No hay ciudades guardadas.");
    expect(almacen.escrituras).toHaveLength(0);
  });

  test("cancela con Enter sin cambios", async () => {
    entrada.encolar("");
    const cfg = config({ cities: [ottawa, madrid], defaultCityId: 1 });
    almacen.sembrar(cfg);

    await establecerCiudadDefault(cfg);

    expect(consola.logs.join("\n")).toContain("Cancelado.");
    expect(cfg.defaultCityId).toBe(1);
    expect(almacen.escrituras).toHaveLength(0);
  });

  test("rechaza números de ciudad inválidos", async () => {
    entrada.encolar("5");
    const cfg = config({ cities: [ottawa, madrid], defaultCityId: 1 });
    almacen.sembrar(cfg);

    await establecerCiudadDefault(cfg);

    expect(consola.logs.join("\n")).toContain('"5" no es un número de ciudad válido.');
    expect(almacen.escrituras).toHaveLength(0);
  });

  test("establece y persiste la ciudad default elegida", async () => {
    entrada.encolar("2");
    const cfg = config({ cities: [ottawa, madrid], defaultCityId: 1 });
    almacen.sembrar(cfg);

    await establecerCiudadDefault(cfg);

    expect(cfg.defaultCityId).toBe(2);
    expect(almacen.archivo).toEqual(config({ cities: [ottawa, madrid], defaultCityId: 2 }));
    expect(almacen.escrituras).toHaveLength(1);
    expect(consola.logs.join("\n")).toContain("Madrid, Madrid, España es ahora la ciudad default.");
  });
});
