// src/utils/geoService.ts
export interface LatLng {
    lat: number
    lng: number
    name?: string
  }
  
  /**
   * coordsForCep: dado um CEP, retorna latitude/longitude.
   * Para produção, implemente chamada a uma API oficial (ViaCEP + IBGE).
   */
  export async function coordsForCep(cep: string): Promise<LatLng> {
    // TODO: implementar lookup real
    return { lat: 0, lng: 0, name: cep }
  }
  