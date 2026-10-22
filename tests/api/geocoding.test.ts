import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { geocode } from "../../src/api/geocoding.ts";
import { GEOCODING_URL } from "../../src/utils/constants.ts";
import { instalarFetch, restaurarFetch, respuestaJson } from "../helpers/fetch.ts";
import { ciudad } from "../helpers/fixtures.ts";

let urls: string[] = [];

beforeEach(() => {
  urls = [];
});

afterEach(() => {
  restaurarFetch();
});

describe("geocode", () => {
  test("consulta el API con name, count=1, language=es y format=json", async () => {
    instalarFetch((url) => {
      urls.push(url);
      return respuestaJson({ results: [ciudad()] });
    });

    await geocode("San Jose");

    expect(urls).toHaveLength(1);
    const url = urls[0] ?? "";
    expect(url.startsWith(GEOCODING_URL)).toBe(true);
    expect(url).toContain("name=San+Jose");
    expect(url).toContain("count=1");
    expect(url).toContain("language=es");
    expect(url).toContain("format=json");
  });

  test("devuelve la primera coincidencia", async () => {
    const madrid = ciudad({ id: 7, name: "Madrid", latitude: 40.4168, longitude: -3.7038 });
    instalarFetch(() => respuestaJson({ results: [madrid, ciudad({ id: 8, name: "Otra" })] }));

    expect(await geocode("Madrid")).toEqual(madrid);
  });

  test("devuelve null cuando no hay resultados", async () => {
    instalarFetch(() => respuestaJson({ results: [] }));

    expect(await geocode("Atlantis")).toBeNull();
  });

  test("devuelve null cuando la respuesta no trae results", async () => {
    instalarFetch(() => respuestaJson({}));

    expect(await geocode("Atlantis")).toBeNull();
  });

  test("lanza un error si el servicio responde con error", async () => {
    instalarFetch(() => respuestaJson({}, 500));

    await expect(geocode("Ottawa")).rejects.toThrow("geocoding respondió 500");
  });
});
