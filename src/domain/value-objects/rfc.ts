// RFC patterns for Mexican tax IDs
const RFC_PERSONA_FISICA = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;
const RFC_PERSONA_MORAL = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/;
const RFC_GENERICO_EXTRANJERO = "XEXX010101000";
const RFC_GENERICO_NACIONAL = "XAXX010101000";

export function validateRfc(rfc: string): boolean {
  const upper = rfc.toUpperCase().trim();
  if (upper === RFC_GENERICO_EXTRANJERO || upper === RFC_GENERICO_NACIONAL) {
    return true;
  }
  return RFC_PERSONA_FISICA.test(upper) || RFC_PERSONA_MORAL.test(upper);
}

export function isGenericForeignRfc(rfc: string): boolean {
  return rfc.toUpperCase().trim() === RFC_GENERICO_EXTRANJERO;
}

export function formatRfc(rfc: string): string {
  return rfc.toUpperCase().trim();
}
