import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { climaCiudadDefault, climaTodasLasCiudades } from "../../src/actions/getWeather.ts";
import { capturarConsola, type CapturaConsola } from "../helpers/console.ts";
import { instalarFetch, restaurarFetch, respuestaJson } from "../helpers/fetch.ts";
import { ciudad, config } from "../helpers/fixtures.ts";

let consola: CapturaConsola;

beforeEach(() => {
  consola = capturarConsola();
});

afterEach(() => {
  consola.restaurar();
  restaurarFetch();
});

/** Sirve temperaturas por latitud; una latitud sin par responde sin current. */
function servirPorLatitud(pares: ReadonlyArray<readonly [number, number]>): void {
  instalarFetch((url) => {
    const latitud = Number(new URL(url).searchParams.get("latitude"));
    const par = pares.find(([lat]) => lat === latitud);
    if (par === undefined) return respuestaJson({});
    return respuestaJson({ current: { temperature_2m: par[1] } });
  });
}

describe("climaCiudadDefault", () => {
  test("avisa cuando no hay ciudad default", async () => {
    await climaCiudadDefault(config());

    expect(consola.logs.join("\n")).toContain("No hay ciudad default.");
  });

  test("muestra la temperatura de la ciudad default", async () => {
    servirPorLatitud([[45.41117, 12.34]]);

    await climaCiudadDefault(config({ cities: [ciudad({ id: 1 })], defaultCityId: 1 }));

    expect(consola.logs).toEqual(["  Ottawa, Ontario, Canadá [default]: 12.3 °C"]);
  });

  test("muestra 'sin datos' si el servicio no devuelve temperatura", async () => {
    servirPorLatitud([]);

    await climaCiudadDefault(config({ cities: [ciudad({ id: 1 })], defaultCityId: 1 }));

    expect(consola.logs).toEqual(["  Ottawa, Ontario, Canadá [default]: sin datos"]);
  });

  test("resuelve los errores de red como texto sin lanzar", async () => {
    instalarFetch(() => respuestaJson({}, 500));

    await climaCiudadDefault(config({ cities: [ciudad({ id: 1 })], defaultCityId: 1 }));

    expect(consola.logs).toEqual([
      "  Ottawa, Ontario, Canadá [default]: error al consultar (el servicio de forecast respondió 500)",
    ]);
  });
});

describe("climaTodasLasCiudades", () => {
  test("avisa cuando no hay ciudades guardadas", async () => {
    await climaTodasLasCiudades(config());

    expect(consola.logs.join("\n")).toContain("No hay ciudades guardadas.");
  });

  test("muestra todas las ciudades en orden y marca la default", async () => {
    const ottawa = ciudad({ id: 1 });
    const madrid = ciudad({ id: 2, name: "Madrid", latitude: 40.4168, longitude: -3.7038, admin1: "Madrid", country: "España" });
    const lima = ciudad({ id: 3, name: "Lima", latitude: -12.0464, longitude: -77.0428, admin1: "Lima", country: "Perú" });
    servirPorLatitud([
      [ottawa.latitude, 10.11],
      [madrid.latitude, 20.22],
      [lima.latitude, 30.33],
    ]);

    await climaTodasLasCiudades(config({ cities: [ottawa, madrid, lima], defaultCityId: 2 }));

    expect(consola.logs).toEqual([
      "  Ottawa, Ontario, Canadá: 10.1 °C",
      "  Madrid, Madrid, España [default]: 20.2 °C",
      "  Lima, Lima, Perú: 30.3 °C",
    ]);
  });
});
