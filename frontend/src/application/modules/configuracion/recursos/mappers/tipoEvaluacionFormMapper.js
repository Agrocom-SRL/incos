import { tipoEvaluacionListMapper } from './tipoEvaluacionListMapper';

const TIPO_EVALUACION_FORM_EMPTY = {
  codigo: '',
  nombre: '',
  descripcion: '',
  esRecuperatorio: false,
};

/** API → valores de formulario */
export const mapTipoEvaluacionToFormValues = (raw) => {
  const t = tipoEvaluacionListMapper(raw) || raw;
  if (!t) return { ...TIPO_EVALUACION_FORM_EMPTY };
  return {
    ...TIPO_EVALUACION_FORM_EMPTY,
    codigo: t.codigo ?? '',
    nombre: t.nombre ?? '',
    descripcion: t.descripcion ?? '',
    esRecuperatorio: Boolean(t.esRecuperatorio),
  };
};

/** Formulario → payload API */
export const mapFormValuesToTipoEvaluacionPayload = (values) => ({
  codigo: values.codigo?.trim(),
  nombre: values.nombre?.trim(),
  descripcion: values.descripcion?.trim() || undefined,
  esRecuperatorio: Boolean(values.esRecuperatorio),
});

/**
 * API detalle → modelo UI.
 *
 * `cantidadEvaluaciones` (uso en el sistema, solo lectura): cuántas
 * evaluaciones/columnas del cuaderno usan este tipo. Lo agrega
 * `GetTipoEvaluacionByIdUseCase` en el objeto raíz `tipoEvaluacion` (no viene
 * en el listado, solo en el GET /:id).
 */
export const mapTipoEvaluacionDetail = (raw) => {
  const payload = raw?.tipoEvaluacion ?? raw;
  const base = tipoEvaluacionListMapper(payload) || payload;
  if (!base) return null;
  const cantidadEvaluaciones = Number(payload?.cantidadEvaluaciones);
  return {
    ...base,
    activo: (payload?.activo ?? raw?.activo) !== false,
    cantidadEvaluaciones: Number.isFinite(cantidadEvaluaciones) ? cantidadEvaluaciones : 0,
  };
};
