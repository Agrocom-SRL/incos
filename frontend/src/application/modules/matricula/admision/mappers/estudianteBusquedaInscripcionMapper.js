/**
 * Mapper: estudianteBusquedaInscripcionMapper
 *
 * Transforma la fila de estudiantes/buscar-para-inscripcion (ya en camelCase desde
 * el backend) agregando ciCompleto. Preserva yaMatriculadoGestionActual y los datos
 * de la gestión (campos aditivos, no los recorta como estudianteListMapper).
 */
import { buildPersonDisplayData } from '@application/utils/formatters';

export const estudianteBusquedaInscripcionMapper = (estudianteBackend) => {
  if (!estudianteBackend) return null;

  const { ciCompleto } = buildPersonDisplayData({
    ci: estudianteBackend.ci,
    expedicion: estudianteBackend.expedicion,
    nombres: estudianteBackend.nombres,
    apellidoPaterno: estudianteBackend.apellidoPaterno,
    apellidoMaterno: estudianteBackend.apellidoMaterno,
  });

  return {
    id: estudianteBackend.id,
    codigoEstudiante: estudianteBackend.codigoEstudiante,
    nombreCompleto: estudianteBackend.nombreCompleto,
    ciCompleto,
    emailPersonal: estudianteBackend.emailPersonal ?? null,
    celular: estudianteBackend.celular ?? null,
    carreraNombre: estudianteBackend.carreraNombre ?? null,
    carreraCodigo: estudianteBackend.carreraCodigo ?? null,
    createdAt: estudianteBackend.createdAt ?? null,
    yaMatriculadoGestionActual: !!estudianteBackend.yaMatriculadoGestionActual,
    gestionActualAnio: estudianteBackend.gestionActualAnio ?? null,
    gestionActualNombre: estudianteBackend.gestionActualNombre ?? null,
    // Campos de la vista 153 ampliada (contrato §3-A2). Se preservan como null
    // cuando el backend aún no los envía para que los flags derivados
    // (esNuevoSistema/tieneHistorialSistema) degraden al comportamiento actual.
    carreraId: estudianteBackend.carreraId ?? null,
    tipoAdmision: estudianteBackend.tipoAdmision ?? null,
    esNuevoSistema:
      estudianteBackend.esNuevoSistema != null ? !!estudianteBackend.esNuevoSistema : null,
    totalInscripciones: estudianteBackend.totalInscripciones ?? null,
  };
};

/**
 * Mapea un array de estudiantes de búsqueda para inscripción
 *
 * @param {Array} estudiantesBackend
 * @returns {Array}
 */
export const mapEstudiantesBusquedaInscripcion = (estudiantesBackend) => {
  if (!Array.isArray(estudiantesBackend)) {
    return [];
  }

  return estudiantesBackend.map(estudianteBusquedaInscripcionMapper).filter(Boolean);
};
