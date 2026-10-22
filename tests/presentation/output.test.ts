import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  mostrarAviso,
  mostrarCiudades,
  mostrarError,
  mostrarExito,
  mostrarMensaje,
} from "../../src/presentation/output.ts";
import { capturarConsola, type CapturaConsola } from "../helpers/console.ts";
import { ciudad, config } from "../helpers/fixtures.ts";

let consola: CapturaConsola;

beforeEach(() => {
  consola = capturarConsola();
});

afterEach(() => {
  consola.restaurar();
});

describe("mensajes", () => {
  test("mostrarMensaje imprime el texto con sangría", () => {
    mostrarMensaje("hola");

    expect(consola.logs).toEqual(["  hola"]);
  });

  test("mostrarAviso imprime el texto con sangría", () => {
    mostrarAviso("cuidado");

    expect(consola.logs).toEqual(["  cuidado"]);
  });

  test("mostrarExito antepone un ✔", () => {
    mostrarExito("listo");

    expect(consola.logs).toEqual(["  ✔ listo"]);
  });

  test("mostrarError antepone un ✖", () => {
    mostrarError("falló");

    expect(consola.logs).toEqual(["  ✖ falló"]);
  });
});

describe("mostrarCiudades", () => {
  test("numera las ciudades y marca la default", () => {
    mostrarCiudades(
      config({
        cities: [
          ciudad({ id: 1 }),
          ciudad({ id: 2, name: "Madrid", latitude: 40.4, longitude: -3.7, admin1: "Madrid", country: "España" }),
        ],
        defaultCityId: 2,
      }),
    );

    expect(consola.logs).toEqual([
      "  1. Ottawa, Ontario, Canadá",
      "  2. Madrid, Madrid, España [default]",
    ]);
  });

  test("no imprime nada si no hay ciudades", () => {
    mostrarCiudades(config());

    expect(consola.logs).toEqual([]);
  });
});
