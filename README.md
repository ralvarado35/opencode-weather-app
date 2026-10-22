Weather CLI APP
El objetivo de esta aplicación es que creemos una aplicación de consola que pida que ingresemos la ciudad, Al final, generaremos un binario ejecutable.

Opciones:
Ingresar el nombre de una ciudad.
Guardar la ciudad por defecto.
Registrar varias otras ciudades para buscar el clima en esas otras ciudades.
Stack
Bun.js
OpenMeteo
Ejemplo de petición http:
Paso 1: Geocoding API.
Paso 2: OpenMeteo API.
https://geocoding-api.open-meteo.com/v1/search?name=Ottawa&count=1&language=es&format=json
https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&current=temperature_2m
Inicializar proyecto
bun init
Ejemplo del menú
Esta es la apariencia que deseamos crear

════════════════════════════════════════
         WEATHER CLI
════════════════════════════════════════
  1. Clima de ciudad default
  2. Clima de todas las ciudades (1)
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  8. Ajustes (°C)
  9. Salir
════════════════════════════════════════
  Selecciona una opción: 5

Releases
La versión se define en el campo `version` de `package.json`. Al hacer push a `main`
con un cambio en ese archivo, el workflow `.github/workflows/release.yml`:

1. Lee la versión y comprueba que el tag `v<versión>` no exista (si existe, no hace nada).
2. Compila el binario en Linux x64, macOS arm64 y Windows x64 con `bun run build`
   (typecheck + tests + compile). Si algún build falla, no se crea el tag.
3. Crea y publica el tag anotado `v<versión>` en el commit construido.
4. Deja cada binario como artifact descargable de la ejecución, con retención de 90 días:
   `weather-linux-x64`, `weather-darwin-arm64`, `weather-windows-x64.exe`.

Para publicar una versión nueva basta con subir `version` en `package.json`.
En los binarios de Linux/macOS hay que dar permiso de ejecución tras la descarga:
`chmod +x weather-linux-x64`.
  