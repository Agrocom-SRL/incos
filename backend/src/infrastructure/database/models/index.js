/**
 * Exportación centralizada de todos los modelos ORM
 * Organizados por categorías para facilitar su uso
 */

// ============================================
// CATÁLOGOS GEOGRÁFICOS
// ============================================
export { Pais } from './Pais.js';
export { Departamento } from './Departamento.js';
export { Provincia } from './Provincia.js';
export { Municipio } from './Municipio.js';

// ============================================
// CATÁLOGOS DE REFERENCIA
// ============================================
export { Idioma } from './Idioma.js';
export { EstadoCivil } from './EstadoCivil.js';
export { TipoDiscapacidad } from './TipoDiscapacidad.js';
export { TipoParentesco } from './TipoParentesco.js';
export { Documentacion } from './Documentacion.js';

// ============================================
// SISTEMA DE SEGURIDAD
// ============================================
export { Rol } from './Rol.js';
export { Permiso } from './Permiso.js';
export { Usuario } from './Usuario.js';
export { RolPermiso } from './RolPermiso.js';
export { Sesion } from './Sesion.js';
export { Personal } from './Personal.js';
export { Rector } from './Rector.js';
export { Director } from './Director.js';
export { Secretaria } from './Secretaria.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 1
// ============================================
export { Carrera } from './Carrera.js';
export { Gestion } from './Gestion.js';
export { EtapaGestion } from './EtapaGestion.js';
export { Periodo } from './Periodo.js';
export { Materia } from './Materia.js';
export { PlanEstudios } from './PlanEstudios.js';
export { Prerrequisito } from './Prerrequisito.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 2
// ============================================
export { Curso } from './Curso.js';
export { Docente } from './Docente.js';
export { AsignacionDocente } from './AsignacionDocente.js';
export { Turno } from './Turno.js';
export { TurnoCurso } from './TurnoCurso.js';

// ============================================
// ESTUDIANTES - PARTE 1
// ============================================
export { Estudiante } from './Estudiante.js';
export { EstudianteDatosAcademicos } from './EstudianteDatosAcademicos.js';
export { EstudianteDocumentoEntrega } from './EstudianteDocumentoEntrega.js';
export { DocumentoEstudiante } from './DocumentoEstudiante.js';
export { EstudianteDiscapacidad } from './EstudianteDiscapacidad.js';
export { EstudianteOrigen } from './EstudianteOrigen.js';

// ============================================
// ESTUDIANTES - PARTE 2
// ============================================
export { BecaDescuento } from './BecaDescuento.js';
export { EstudianteBeca } from './EstudianteBeca.js';
export { LicenciaSolicitud } from './LicenciaSolicitud.js';
export { EstudianteApoderado } from './EstudianteApoderado.js';

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
export { ConfiguracionSistema } from './ConfiguracionSistema.js';
