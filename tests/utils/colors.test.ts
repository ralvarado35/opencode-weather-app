import { describe, expect, test } from "bun:test";
import { bold, cyan, green, red, yellow } from "../../src/utils/colors.ts";

// tests/preload.ts define NO_COLOR=1 antes de importar colors.ts, así que las
// funciones devuelven el texto tal cual (sin códigos ANSI) durante los tests.
describe("colores ANSI", () => {
  test("devuelven el texto sin códigos cuando NO_COLOR está activa", () => {
    expect(cyan("hola")).toBe("hola");
    expect(green("hola")).toBe("hola");
    expect(red("hola")).toBe("hola");
    expect(yellow("hola")).toBe("hola");
    expect(bold("hola")).toBe("hola");
  });

  test("conservan el texto completo, incluidos acentos y emojis", () => {
    const texto = "Canadá ✔ 👋";
    expect(cyan(texto)).toBe(texto);
    expect(green(texto)).toBe(texto);
  });
});
