import { beforeEach, describe, expect, test } from "bun:test";
import { ciudad, config } from "../helpers/fixtures.ts";
import { almacen } from "../helpers/mocks.ts";

const { loadSettings, saveSettings } = await import("../../src/storage/settingsStorage.ts");

beforeEach(() => {
  almacen.reiniciar();
});

describe("loadSettings", () => {
  test("sin archivo devuelve valores por defecto", async () => {
    expect(await loadSettings()).toEqual({ defaultCityId: null, unit: "c" });
  });

  test("devuelve los valores guardados", async () => {
    almacen.sembrar(config({ cities: [ciudad({ id: 2 })], defaultCityId: 2, unit: "f" }));

    expect(await loadSettings()).toEqual({ defaultCityId: 2, unit: "f" });
  });
});

describe("saveSettings", () => {
  test("persiste las preferencias preservando las ciudades", async () => {
    const ciudades = [ciudad({ id: 1 }), ciudad({ id: 2, name: "Madrid", latitude: 40.4, longitude: -3.7 })];
    almacen.sembrar(config({ cities: ciudades, defaultCityId: 1, unit: "c" }));

    await saveSettings({ defaultCityId: 2, unit: "f" });

    expect(almacen.archivo).toEqual(
      config({ cities: ciudades, defaultCityId: 2, unit: "f" }),
    );
    expect(almacen.escrituras).toHaveLength(1);
  });

  test("usa la configuración inicial cuando no hay archivo", async () => {
    await saveSettings({ defaultCityId: 3, unit: "f" });

    expect(almacen.archivo).toEqual(config({ defaultCityId: 3, unit: "f" }));
  });
});
