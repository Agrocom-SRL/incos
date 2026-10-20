/**
 * Mapper de formulario: catálogo maestro Becas y descuentos (módulo Finanzas).
 * Namespace propio (NO reutiliza los mappers de `application/modules/matricula/becas/`,
 * que son del flujo de asignación de becas a estudiantes en Matrícula).
 */

import { becaDescuentoListMapper } from './becaDescuentoListMapper';

const BECA_DESCUENTO_FORM_EMPTY = {
  nombre: '',
  codigo: '',
  porcentaje: null,
  descripcion: '',
  requiereDocumentacion: false,
  requiereAprobacionRector: false,
  esAutomatica: false,
  tipoAutomatica: undefined,
  promedioMinimo: null,
};

/** API → valores de formulario. */
export const mapBecaDescuentoToFormValues = (raw) => {
  const b = becaDescuentoListMapper(raw) || raw;
  if (!b) return { ...BECA_DESCUENTO_FORM_EMPTY };
  return {
    ...BECA_DESCUENTO_FORM_EMPTY,
    nombre: b.nombre ?? '',
    codigo: b.codigo ?? '',
    porcentaje: b.porcentaje ?? null,
    descripcion: b.descripcion ?? '',
    requiereDocumentacion: !!b.requiereDocumentacion,
    requiereAprobacionRector: !!b.requiereAprobacionRector,
    esAutomatica: !!b.esAutomatica,
    tipoAutomatica: b.tipoAutomatica ?? undefined,
    promedioMinimo: b.promedioMinimo ?? null,
    // `activo` solo aplica en modo edición (se asigna al crear, ver formSections).
    ...(b.activo != null ? { activo: b.activo } : {}),
  };
};

/** Formulario → payload API (`beca-descuento.validator.js`: shape en español). */
export const mapFormValuesToBecaDescuentoPayload = (values) => {
  const esAutomatica = !!values.esAutomatica;
  return {
    nombre: values.nombre?.trim(),
    codigo: values.codigo?.trim() || undefined,
    porcentaje: values.porcentaje != null ? Number(values.porcentaje) : undefined,
    descripcion: values.descripcion?.trim() || undefined,
    requiereDocumentacion: !!values.requiereDocumentacion,
    requiereAprobacionRector: !!values.requiereAprobacionRector,
    esAutomatica,
    tipoAutomatica: esAutomatica ? (values.tipoAutomatica ?? undefined) : undefined,
    promedioMinimo:
      esAutomatica && values.tipoAutomatica === 'PROMEDIO_90' && values.promedioMinimo != null
        ? Number(values.promedioMinimo)
        : undefined,
    ...(values.activo != null ? { activo: !!values.activo } : {}),
  };
};

/** API detalle → modelo UI (ficha). */
export const mapBecaDescuentoDetail = (raw) => {
  const payload = raw?.becaDescuento ?? raw;
  const base = becaDescuentoListMapper(payload) || payload;
  if (!base) return null;
  return {
    ...base,
    activo: (payload?.activo ?? raw?.activo) !== false,
  };
};

export default mapBecaDescuentoToFormValues;
