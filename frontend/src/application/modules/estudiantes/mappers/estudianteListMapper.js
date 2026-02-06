/**
 * Mapper: estudianteListMapper
 *
 * Transforma datos del backend al formato de lista: nombreCompleto, ciCompleto, datos académicos
 * (carreraNombre, gestionIngresoNombre, tipoAdmision) y datos laborales (datosTrabajo).
 */
import { buildPersonDisplayData } from '@application/utils/formatters';

function buildDatosTrabajo(trabaja, empresaInstitucion, cargo) {
  if (!trabaja) return '—';
  const parts = [];
  if (empresaInstitucion) parts.push(empresaInstitucion);
  if (cargo) parts.push(cargo);
  return parts.length ? parts.join(' · ') : 'Sí';
}

export const estudianteListMapper = (estudianteBackend) => {
  if (!estudianteBackend) return null;

  const { ciCompleto, nombreCompleto } = buildPersonDisplayData({
    ci: estudianteBackend.ci,
    expedicion: estudianteBackend.expedicion,
    nombres: estudianteBackend.nombres,
    apellidoPaterno: estudianteBackend.apellidoPaterno,
    apellidoMaterno: estudianteBackend.apellidoMaterno,
  });

  const datosTrabajo = buildDatosTrabajo(
    estudianteBackend.trabaja,
    estudianteBackend.empresaInstitucion,
    estudianteBackend.cargo
  );

  return {
    id: estudianteBackend.id,
    codigoEstudiante: estudianteBackend.codigoEstudiante,
    ciCompleto,
    nombreCompleto,
    genero: estudianteBackend.genero,
    emailPersonal: estudianteBackend.emailPersonal,
    celular: estudianteBackend.celular,
    createdAt: estudianteBackend.createdAt,
    // Datos académicos (desde vista_estudiante_datos_academicos en ListStudentsUseCase)
    carreraNombre: estudianteBackend.carreraNombre ?? null,
    gestionIngresoNombre: estudianteBackend.gestionIngresoNombre ?? null,
    tipoAdmision: estudianteBackend.tipoAdmision ?? null,
    // Datos laborales (compuesto + partes)
    datosTrabajo,
    trabaja: estudianteBackend.trabaja,
    empresaInstitucion: estudianteBackend.empresaInstitucion ?? null,
    cargo: estudianteBackend.cargo ?? null,
    estadoCivilNombre: estudianteBackend.estadoCivilNombre ?? null,
  };
};

/**
 * Mapea un array de estudiantes del backend al formato de lista
 * 
 * @param {Array} estudiantesBackend - Array de estudiantes desde el backend
 * @returns {Array} - Array de estudiantes mapeados para la lista
 */
export const mapEstudiantesList = (estudiantesBackend) => {
  if (!Array.isArray(estudiantesBackend)) {
    return [];
  }

  return estudiantesBackend.map(estudianteListMapper).filter(Boolean);
};

