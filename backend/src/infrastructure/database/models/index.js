/**
 * Exportación centralizada de todos los modelos ORM
 * Organizados por categorías para facilitar su uso
 */

// ============================================
// CATÁLOGOS GEOGRÁFICOS
// ============================================
export { Pais } from './pais.js';
export { Departamento } from './departamento.js';
export { Provincia } from './provincia.js';
export { Municipio } from './municipio.js';

// ============================================
// CATÁLOGOS DE REFERENCIA
// ============================================
export { Idioma } from './idioma.js';
export { EstadoCivil } from './estado_civil.js';
export { TipoDiscapacidad } from './tipo_discapacidad.js';
export { TipoParentesco } from './tipo_parentesco.js';
export { Documentacion } from './documentacion.js';

// ============================================
// SISTEMA DE SEGURIDAD
// ============================================
export { Rol } from './rol.js';
export { Permiso } from './permiso.js';
export { Usuario } from './usuario.js';
export { RolPermiso } from './rol_permiso.js';
export { Sesion } from './sesion.js';
export { Personal } from './personal.js';
export { Rector } from './rector.js';
export { Director } from './director.js';
export { Secretaria } from './secretaria.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 1
// ============================================
export { Carrera } from './carrera.js';
export { Gestion } from './gestion.js';
export { EtapaGestion } from './etapa_gestion.js';
export { Periodo } from './periodo.js';
export { Materia } from './materia.js';
export { PlanEstudios } from './plan_estudios.js';
export { Prerrequisito } from './prerrequisito.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 2
// ============================================
export { Curso } from './curso.js';
export { Docente } from './docente.js';
export { AsignacionDocente } from './asignacion_docente.js';
export { Turno } from './turno.js';
export { TurnoCurso } from './turno_curso.js';

// ============================================
// ESTUDIANTES - PARTE 1
// ============================================
export { Estudiante } from './estudiante.js';
export { EstudianteDatosAcademicos } from './estudiante_datos_academicos.js';
export { EstudianteDocumentoEntrega } from './estudiante_documento_entrega.js';
export { DocumentoEstudiante } from './documento_estudiante.js';
export { EstudianteDiscapacidad } from './estudiante_discapacidad.js';
export { EstudianteOrigen } from './estudiante_origen.js';

// ============================================
// ESTUDIANTES - PARTE 2
// ============================================
export { BecaDescuento } from './beca_descuento.js';
export { EstudianteBeca } from './estudiante_beca.js';
export { LicenciaSolicitud } from './licencia_solicitud.js';
export { EstudianteApoderado } from './estudiante_apoderado.js';

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
export { ConfiguracionSistema } from './configuracion_sistema.js';
