import { beforeEach, describe, expect, test } from "bun:test";
import { ciudad, config } from "../helpers/fixtures.ts";
import { almacen } from "../helpers/mocks.ts";

const { loadCities, saveCities } = await import("../../src/storage/citiesStorage.ts");

beforeEach(() => {
  almacen.reiniciar();
});

describe("loadCities", () => {
  test("devuelve lista vacía cuando no hay archivo", async () => {
    expect(await loadCities()).toEqual([]);
  });

  test("devuelve las ciudades guardadas", async () => {
    const ciudades = [
      ciudad({ id: 1 }),
      ciudad({ id: 2, name: "Madrid", latitude: 40.4, longitude: -3.7 }),
    ];
    almacen.sembrar(config({ cities: ciudades }));

    expect(await loadCities()).toEqual(ciudades);
  });
});

describe("saveCities", () => {
  test("persiste la lista preservando las preferencias", async () => {
    almacen.sembrar(config({ cities: [ciudad({ id: 9 })], defaultCityId: 9, unit: "f" }));
    const lima = ciudad({ id: 3, name: "Lima", latitude: -12.05, longitude: -77.04 });

    await saveCities([lima]);

    expect(almacen.archivo).toEqual(
      config({ cities: [lima], defaultCityId: 9, unit: "f" }),
    );
    expect(almacen.escrituras).toHaveLength(1);
  });

  test("usa la configuración inicial cuando no hay archivo", async () => {
    const lima = ciudad({ id: 3, name: "Lima", latitude: -12.05, longitude: -77.04 });

    await saveCities([lima]);

    expect(almacen.archivo).toEqual(config({ cities: [lima] }));
  });
});
