import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { listarCiudades } from "../../src/actions/listCities.ts";
import { capturarConsola, type CapturaConsola } from "../helpers/console.ts";
import { ciudad, config } from "../helpers/fixtures.ts";

let consola: CapturaConsola;

beforeEach(() => {
  consola = capturarConsola();
});

afterEach(() => {
  consola.restaurar();
});

describe("listarCiudades", () => {
  test("avisa cuando no hay ciudades guardadas", async () => {
    await listarCiudades(config());

    expect(consola.logs.join("\n")).toContain("No hay ciudades guardadas. Usa la opción 3 para agregar una.");
  });

  test("lista las ciudades numeradas y marca la default", async () => {
    const ottawa = ciudad({ id: 1 });
    const madrid = ciudad({ id: 2, name: "Madrid", latitude: 40.4, longitude: -3.7, admin1: "Madrid", country: "España" });

    await listarCiudades(config({ cities: [ottawa, madrid], defaultCityId: 2 }));

    expect(consola.logs).toEqual([
      "  1. Ottawa, Ontario, Canadá",
      "  2. Madrid, Madrid, España [default]",
    ]);
  });
});
