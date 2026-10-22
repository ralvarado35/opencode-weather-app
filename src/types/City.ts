/** Ciudad guardada en la configuración (y forma del resultado de geocoding). */
export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}
