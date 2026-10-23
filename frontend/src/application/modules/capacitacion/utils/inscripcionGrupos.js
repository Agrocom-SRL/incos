import { formatBs } from '@application/utils/formatters';
import { ESTADOS_INSCRIPCION_CAP_VIGENTES } from './capacitacionPills';

/**
 * Reglas de elección de grupo al inscribir (puras, probadas aparte):
 * un solo grupo se preselecciona; con dos o más la elección es obligatoria;
 * sin grupos no se pide (el curso aún es borrador o es virtual).
 */

/** Id del grupo a preseleccionar (único grupo) o `null`. */
export const resolverGrupoInicial = (grupos = []) =>
  grupos.length === 1 ? grupos[0].id : null;

/** Mensaje de error si falta elegir grupo (≥2 grupos y ninguno elegido), o `null`. */
export const validarGrupoElegido = (grupos = [], grupoId = null) =>
  grupos.length >= 2 && grupoId == null ? 'Elija el grupo al que se inscribe el participante' : null;

/**
 * Montos cobrados al inscribir según los interruptores del curso: un concepto
 * no cobrado vale 0 (no se ofrece ni se pide). Con costo del curso externo
 * (`pagoCursoExterno`) el instituto no cobra el curso: solo la matrícula.
 * La matrícula es la del grupo elegido (o la del curso si el grupo no tiene).
 * @param {Object} curso
 * @param {Object|null} [grupo] grupo elegido
 * @returns {{MATRICULA: number, CURSO: number}}
 */
export const montosCobradosCurso = (curso, grupo = null) => ({
  MATRICULA: curso?.cobraMatricula ? Number(grupo?.costoMatricula ?? curso.costoMatricula) || 0 : 0,
  CURSO: curso?.tieneCosto && !curso?.pagoCursoExterno ? Number(curso.costo) || 0 : 0,
});

/**
 * Motivo por el que el grupo de una inscripción NO se puede cambiar (tooltip
 * del campo deshabilitado), o `null` si es editable: solo PENDIENTE/INSCRITO y
 * con el curso con al menos un grupo.
 */
export const motivoGrupoNoEditable = (inscripcion, grupos = []) => {
  if (!ESTADOS_INSCRIPCION_CAP_VIGENTES.includes(inscripcion?.estado)) {
    return 'No se puede cambiar el grupo de una inscripción retirada o anulada';
  }
  if (grupos.length === 0) return 'El curso no tiene grupos definidos';
  return null;
};

/**
 * Opciones del select de grupo al editar: nombre, horarios y cupo. Un grupo con
 * el cupo lleno se deshabilita, salvo el grupo actual de la inscripción.
 */
export const opcionesGrupoEdicion = (grupos = [], grupoActualId = null) =>
  grupos.map((g) => {
    const lleno = g.cupoDisponible === 0 && g.id !== grupoActualId;
    const cupo =
      g.cupoDisponible == null
        ? 'sin tope de cupo'
        : lleno
          ? 'cupo completo'
          : `${g.cupoDisponible} ${g.cupoDisponible === 1 ? 'cupo' : 'cupos'}`;
    return {
      value: g.id,
      disabled: lleno,
      label: [
        g.nombre,
        g.horariosLabel || null,
        g.matricula > 0 ? `Matrícula Bs ${formatBs(g.matricula)}` : null,
        cupo,
      ]
        .filter(Boolean)
        .join(' · '),
    };
  });
