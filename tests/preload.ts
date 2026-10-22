// Se ejecuta antes de cargar cualquier test (ver bunfig.toml).
//
// colors.ts decide si pinta con ANSI al importarse: si `NO_COLOR` está definida
// con un valor no vacío, los colores quedan desactivados y las aserciones
// pueden comparar texto plano sin importar si la terminal es una TTY.
process.env.NO_COLOR = "1";
