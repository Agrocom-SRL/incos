/**
 * Etiqueta del concepto del aporte académico — fuente única compartida por el
 * resumen del paso "Estado del aporte" (ContributionDetailSummary) y el resumen
 * del paso "Confirmación" (PagoConfirmacionResumen).
 */

/**
 * Construye la etiqueta sin duplicar el prefijo cuando el nombre de la gestión
 * ya lo trae (p. ej. "Gestión Regular 2026" → "Aporte académico - Gestión Regular 2026").
 * @param {string|number|null} name - Nombre o año de la gestión
 */
export const buildConceptoNombre = (name) => {
  if (!name) return 'Aporte académico';
  const texto = String(name).trim();
  return /^gesti[óo]n\b/i.test(texto)
    ? `Aporte académico - ${texto}`
    : `Aporte académico - Gestión ${texto}`;
};

/**
 * Resuelve el concepto desde el estado actual del aporte (cabecera) o, en su
 * defecto, desde la configuración de aporte activa.
 * @param {Object|null} estadoActualAporte - Estado actual del aporte (con gestion)
 * @param {Object|null} configuracionAporte - Configuración de aporte activa
 */
export const resolveConceptoNombre = (estadoActualAporte, configuracionAporte) => {
  if (estadoActualAporte?.gestion) {
    const g = estadoActualAporte.gestion;
    return buildConceptoNombre(g.nombre ?? g.name ?? g.anio ?? g.year);
  }
  return buildConceptoNombre(
    configuracionAporte?.gestionName ||
      configuracionAporte?.gestion?.name ||
      configuracionAporte?.gestion?.year
  );
};
