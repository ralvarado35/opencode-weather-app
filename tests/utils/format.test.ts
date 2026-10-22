import { describe, expect, test } from "bun:test";
import type { City } from "../../src/types/City.ts";
import {
  formatearTemperatura,
  mensajeError,
  nombreCompleto,
  simboloUnidad,
} from "../../src/utils/format.ts";

const base: City = { id: 1, name: "Ottawa", latitude: 45.41117, longitude: -75.69812 };

describe("simboloUnidad", () => {
  test("devuelve °C para celsius", () => {
    expect(simboloUnidad("c")).toBe("°C");
  });

  test("devuelve °F para fahrenheit", () => {
    expect(simboloUnidad("f")).toBe("°F");
  });
});

describe("nombreCompleto", () => {
  test("une nombre, provincia y país", () => {
    expect(nombreCompleto({ ...base, admin1: "Ontario", country: "Canadá" })).toBe(
      "Ottawa, Ontario, Canadá",
    );
  });

  test("omite admin1 cuando falta", () => {
    expect(nombreCompleto({ ...base, country: "Canadá" })).toBe("Ottawa, Canadá");
  });

  test("omite country cuando falta", () => {
    expect(nombreCompleto({ ...base, admin1: "Ontario" })).toBe("Ottawa, Ontario");
  });

  test("omite campos vacíos", () => {
    expect(nombreCompleto({ ...base, admin1: "", country: "" })).toBe("Ottawa");
  });

  test("devuelve solo el nombre cuando no hay más datos", () => {
    expect(nombreCompleto(base)).toBe("Ottawa");
  });
});

describe("formatearTemperatura", () => {
  test("redondea a un decimal y agrega la unidad", () => {
    expect(formatearTemperatura(23.456, "c")).toBe("23.5 °C");
    expect(formatearTemperatura(23.44, "f")).toBe("23.4 °F");
  });

  test("formatea el cero", () => {
    expect(formatearTemperatura(0, "c")).toBe("0.0 °C");
  });

  test("devuelve 'sin datos' cuando no hay temperatura", () => {
    expect(formatearTemperatura(null, "c")).toBe("sin datos");
    expect(formatearTemperatura(null, "f")).toBe("sin datos");
  });
});

describe("mensajeError", () => {
  test("extrae el mensaje de un Error", () => {
    expect(mensajeError(new Error("falló la red"))).toBe("falló la red");
  });

  test("convierte valores desconocidos a texto", () => {
    expect(mensajeError("texto plano")).toBe("texto plano");
    expect(mensajeError(42)).toBe("42");
  });
});
