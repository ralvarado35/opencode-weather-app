import type { Config } from "./Config.ts";

/** Claves válidas del menú principal. */
export type MenuOptionKey = "1" | "2" | "3" | "4" | "5" | "6" | "8" | "9";

/** Una entrada del menú principal. */
export interface MenuOption {
  key: MenuOptionKey;
  /** Etiqueta mostrada al usuario; puede depender del estado actual. */
  label: (config: Config) => string;
  /** Flujo que se ejecuta al elegir esta opción. */
  run: (config: Config) => Promise<void>;
}
