import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { capturarConsola, type CapturaConsola } from "../helpers/console.ts";
import { instalarFetch, restaurarFetch, respuestaJson } from "../helpers/fetch.ts";
import { ciudad, config } from "../helpers/fixtures.ts";
import { almacen, entrada } from "../helpers/mocks.ts";

const { agregarCiudad } = await import("../../src/actions/addCity.ts");

const lima = { id: 5, name: "Lima", latitude: -12.05, longitude: -77.04, admin1: "Lima", country: "Perú" };

let consola: CapturaConsola;
let urls: string[];

beforeEach(() => {
  consola = capturarConsola();
  entrada.reiniciar();
  almacen.reiniciar();
  urls = [];
});

afterEach(() => {
  consola.restaurar();
  restaurarFetch();
  expect(entrada.quedan()).toBe(0);
});

/** Simula la respuesta de geocoding (y registra la URL consultada). */
function servirGeocoding(resultados: unknown, status = 200): void {
  instalarFetch((url) => {
    urls.push(url);
    return respuestaJson({ results: resultados }, status);
  });
}

describe("agregarCiudad", () => {
  test("avisa cuando el nombre está vacío y no consulta el API", async () => {
    entrada.encolar("   ");
    const cfg = config();

    await agregarCiudad(cfg);

    expect(consola.logs.join("\n")).toContain("No ingresaste ningún nombre.");
    expect(urls).toHaveLength(0);
    expect(almacen.escrituras).toHaveLength(0);
  });

  test("reporta los errores de geocoding sin persistir nada", async () => {
    servirGeocoding([], 500);
    entrada.encolar("ottawa");
    const cfg = config();

    await agregarCiudad(cfg);

    expect(consola.logs.join("\n")).toContain(
      "Error al buscar la ciudad: el servicio de geocoding respondió 500",
    );
    expect(almacen.escrituras).toHaveLength(0);
  });

  test("avisa cuando no se encuentra la ciudad", async () => {
    servirGeocoding([]);
    entrada.encolar("atlantis");
    const cfg = config();

    await agregarCiudad(cfg);

    expect(consola.logs.join("\n")).toContain('No se encontró ninguna ciudad llamada "atlantis".');
    expect(almacen.escrituras).toHaveLength(0);
  });

  test("no duplica una ciudad que ya está en la lista", async () => {
    servirGeocoding([ciudad({ id: 1, name: "Ottawa" })]);
    entrada.encolar("ottawa");
    const cfg = config({ cities: [ciudad({ id: 1 })], defaultCityId: 1 });

    await agregarCiudad(cfg);

    expect(consola.logs.join("\n")).toContain("Esa ciudad ya está en tu lista");
    expect(cfg.cities).toHaveLength(1);
    expect(almacen.escrituras).toHaveLength(0);
  });

  test("no agrega nada si el usuario no confirma", async () => {
    servirGeocoding([lima]);
    entrada.encolar("lima", "n");
    const cfg = config();

    await agregarCiudad(cfg);

    expect(consola.logs.join("\n")).toContain("Encontrada: Lima, Lima, Perú (lat -12.05, lon -77.04)");
    expect(consola.logs.join("\n")).toContain("No se agregó.");
    expect(cfg.cities).toHaveLength(0);
    expect(almacen.escrituras).toHaveLength(0);
  });

  test("agrega la primera ciudad y la establece como default", async () => {
    servirGeocoding([{ ...lima, population: 10_000_000, timezone: "America/Lima" }]);
    entrada.encolar("lima", "s");
    const cfg = config();
    almacen.sembrar(cfg);

    await agregarCiudad(cfg);

    expect(cfg.cities).toEqual([lima]);
    expect(cfg.defaultCityId).toBe(5);
    expect(almacen.archivo).toEqual(config({ cities: [lima], defaultCityId: 5 }));
    // saveCities + saveSettings (por ser la primera ciudad)
    expect(almacen.escrituras).toHaveLength(2);
    // Solo se persisten los campos conocidos de City.
    expect(almacen.archivo?.cities[0] ?? {}).not.toHaveProperty("population");
    expect(almacen.archivo?.cities[0] ?? {}).not.toHaveProperty("timezone");
    expect(consola.logs.join("\n")).toContain("Lima, Lima, Perú agregada y establecida como default.");
  });

  test("respeta el default existente al agregar otra ciudad", async () => {
    servirGeocoding([{ id: 2, name: "Madrid", latitude: 40.4, longitude: -3.7, admin1: "Madrid", country: "España" }]);
    entrada.encolar("madrid", "s");
    const cfg = config({ cities: [ciudad({ id: 1 })], defaultCityId: 1 });
    almacen.sembrar(cfg);

    await agregarCiudad(cfg);

    expect(cfg.defaultCityId).toBe(1);
    expect(almacen.archivo?.defaultCityId).toBe(1);
    expect(almacen.archivo?.cities).toHaveLength(2);
    // Solo saveCities (el default no cambia).
    expect(almacen.escrituras).toHaveLength(1);
    expect(consola.logs.join("\n")).toContain("Madrid, Madrid, España agregada.");
  });
});
