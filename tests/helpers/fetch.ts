/** Sustitución de `globalThis.fetch` para probar la capa API sin red. */

export type ManejadorFetch = (url: string, init?: RequestInit) => Promise<Response> | Response;

const fetchOriginal = globalThis.fetch;

/** Reemplaza el fetch global por un manejador basado en la URL solicitada. */
export function instalarFetch(manejador: ManejadorFetch): void {
  globalThis.fetch = (async (
    entrada: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> => {
    const url = typeof entrada === "string" ? entrada : entrada instanceof URL ? entrada.href : entrada.url;
    return manejador(url, init);
  }) as typeof fetch;
}

/** Restaura el fetch original del runtime (llamar en afterEach). */
export function restaurarFetch(): void {
  globalThis.fetch = fetchOriginal;
}

/** Respuesta JSON con status configurable. */
export function respuestaJson(cuerpo: unknown, status = 200): Response {
  return Response.json(cuerpo, { status });
}
