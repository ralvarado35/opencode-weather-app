import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { fetchTemperature } from "../../src/api/weather.ts";
import { FORECAST_URL } from "../../src/utils/constants.ts";
import { instalarFetch, restaurarFetch, respuestaJson } from "../helpers/fetch.ts";

let urls: string[] = [];

beforeEach(() => {
  urls = [];
});

afterEach(() => {
  restaurarFetch();
});

function servirTemperatura(temperatura: number | null = 12.3): void {
  instalarFetch((url) => {
    urls.push(url);
    return respuestaJson(temperatura === null ? {} : { current: { temperature_2m: temperatura } });
  });
}

describe("fetchTemperature", () => {
  test("envía latitud, longitud y current=temperature_2m", async () => {
    servirTemperatura();

    await fetchTemperature(45.41117, -75.69812, "c");

    const url = urls[0] ?? "";
    expect(url.startsWith(FORECAST_URL)).toBe(true);
    expect(url).toContain("latitude=45.41117");
    expect(url).toContain("longitude=-75.69812");
    expect(url).toContain("current=temperature_2m");
    expect(url).not.toContain("temperature_unit");
  });

  test("pide la temperatura en fahrenheit cuando la unidad es f", async () => {
    servirTemperatura();

    await fetchTemperature(1, 2, "f");

    expect(urls[0] ?? "").toContain("temperature_unit=fahrenheit");
  });

  test("devuelve la temperatura actual", async () => {
    servirTemperatura(12.3);

    expect(await fetchTemperature(1, 2, "c")).toBe(12.3);
  });

  test("devuelve null si la respuesta no trae current", async () => {
    servirTemperatura(null);

    expect(await fetchTemperature(1, 2, "c")).toBeNull();
  });

  test("devuelve null si no trae temperature_2m", async () => {
    instalarFetch(() => respuestaJson({ current: {} }));

    expect(await fetchTemperature(1, 2, "c")).toBeNull();
  });

  test("lanza un error si el servicio responde con error", async () => {
    instalarFetch(() => respuestaJson({}, 503));

    await expect(fetchTemperature(1, 2, "c")).rejects.toThrow("forecast respondió 503");
  });
});
