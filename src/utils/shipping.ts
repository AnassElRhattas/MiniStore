function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getShippingFee(city: string): number {
  if (!city) return 0;
  return normalizeCity(city) === 'el jadida' ? 0 : 35;
}

export function isFreeShipping(city: string): boolean {
  return getShippingFee(city) === 0;
}
