// modules/estudiantes/helpers/resolveGeographicCascade.js
/**
 * Helper para resolver la cascada geográfica completa
 * 
 * Responsabilidad: Resolver país, departamento y provincia
 * a partir de un municipio (para nacimiento y residencia)
 */

/**
 * Resuelve la cascada geográfica completa para un municipio
 * @param {Object} estudiante - Datos del estudiante
 * @param {string} tipo - 'nacimiento' o 'residencia'
 * @param {Array} municipios - Lista de municipios
 * @param {Array} provincias - Lista de provincias
 * @param {Array} departamentos - Lista de departamentos
 * @returns {Object} Estudiante con cascada geográfica resuelta
 */
export const resolveGeographicCascade = (
  estudiante,
  tipo,
  municipios = [],
  provincias = [],
  departamentos = []
) => {
  if (!municipios || municipios.length === 0 || 
      !provincias || provincias.length === 0 || 
      !departamentos || departamentos.length === 0) {
    console.warn(`[resolveGeographicCascade] Datos geográficos no disponibles para ${tipo}`);
    return estudiante;
  }

  const municipioKey = tipo === 'nacimiento' ? 'municipioNacimientoId' : 'municipioResidenciaId';
  const provinciaKey = tipo === 'nacimiento' ? 'provinciaNacimientoId' : 'provinciaResidenciaId';
  const departamentoKey = tipo === 'nacimiento' ? 'departamentoNacimientoId' : 'departamentoResidenciaId';
  const paisKey = tipo === 'nacimiento' ? 'paisNacimientoId' : 'paisResidenciaId';

  const municipioId = estudiante[municipioKey];
  
  if (!municipioId) {
    return estudiante;
  }

  // Buscar municipio
  const municipio = municipios.find(m => m.id === municipioId);
  if (!municipio || !municipio.provinciaId) {
    return estudiante;
  }

  // Buscar provincia
  const provincia = provincias.find(p => p.id === municipio.provinciaId);
  if (!provincia || !provincia.departamentoId) {
    return estudiante;
  }

  // Buscar departamento
  const departamento = departamentos.find(d => d.id === provincia.departamentoId);
  if (!departamento) {
    return estudiante;
  }

  // Establecer la cascada completa
  estudiante[paisKey] = departamento.paisId || estudiante[paisKey] || 1;
  estudiante[departamentoKey] = provincia.departamentoId;
  estudiante[provinciaKey] = municipio.provinciaId;
  // El municipio ya está establecido

  return estudiante;
};

/**
 * Resuelve la cascada geográfica completa para nacimiento y residencia
 * @param {Object} estudiante - Datos del estudiante
 * @param {Array} municipios - Lista de municipios
 * @param {Array} provincias - Lista de provincias
 * @param {Array} departamentos - Lista de departamentos
 * @returns {Object} Estudiante con cascadas geográficas resueltas
 */
export const resolveAllGeographicCascades = (
  estudiante,
  municipios = [],
  provincias = [],
  departamentos = []
) => {
  let estudianteResuelto = { ...estudiante };

  // Resolver cascada de nacimiento
  estudianteResuelto = resolveGeographicCascade(
    estudianteResuelto,
    'nacimiento',
    municipios,
    provincias,
    departamentos
  );

  // Resolver cascada de residencia
  estudianteResuelto = resolveGeographicCascade(
    estudianteResuelto,
    'residencia',
    municipios,
    provincias,
    departamentos
  );

  return estudianteResuelto;
};
