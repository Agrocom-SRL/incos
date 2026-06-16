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
export { UsuarioPermiso } from './usuario_permiso.js';
export { Sesion } from './sesion.js';
export { Personal } from './personal.js';
export { Rector } from './rector.js';
export { Director } from './director.js';
export { Secretaria } from './secretaria.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 1
// ============================================
export { Carrera } from './carrera.js';
export { Materia } from './materia.js';
export { PlanEstudios } from './plan_estudios.js';
export { Periodo } from './periodo.js';
export { AsignaturaPlan } from './asignatura_plan.js';
export { Prerrequisito } from './prerrequisito.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 3 (Calendario)
// ============================================
export { Actividad } from './actividad.js';
export { Gestion } from './gestion.js';
export { GestionPlan } from './gestion_plan.js';
export { PeriodoAcademico } from './periodo_academico.js';
export { ActividadCalendario } from './actividad_calendario.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 2
// ============================================
export { Docente } from './docente.js';
export { Paralelo } from './paralelo.js';
export { Aula } from './aula.js';
export { Horario } from './horario.js';
export { AsignacionDocente } from './asignacion_docente.js';
export { AsignacionHorario } from './asignacion_horario.js';
export { ParaleloGestion } from './paralelo_gestion.js';
export { OfertaCurso } from './oferta_curso.js';

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
export { EstudianteApoderado } from './estudiante_apoderado.js';

// ============================================
// TRANSITABILIDADES Y TRASPASOS
// ============================================
export { Institucion } from './institucion.js';
export { Transitabilidad } from './transitabilidad.js';
export { Traspaso } from './traspaso.js';

// ============================================
// INSCRIPCIONES
// ============================================
export { Inscripcion } from './inscripcion.js';
export { HistorialPrevio } from './historial_previo.js';
export { MatriculaMateria } from './matricula_materia.js';
export { HistorialMatricula } from './historial_matricula.js';

// ============================================
// EVALUACIONES
// ============================================
export { TipoEvaluacion } from './tipo_evaluacion.js';
export { ConfiguracionEvaluacion } from './configuracion_evaluacion.js';
export { BimestreMatricula } from './bimestre_matricula.js';
export { Evaluacion } from './evaluacion.js';
export { EvaluacionNota } from './evaluacion_nota.js';

// ============================================
// NIVELACIONES
// ============================================
export { Nivelacion } from './nivelacion.js';

// ============================================
// ASISTENCIAS Y LICENCIAS
// ============================================
export { Licencia } from './licencia.js';
export { ClaseNoDictada } from './clase_no_dictada.js';
export { Asistencia } from './asistencia.js';
export { SesionClase } from './sesion_clase.js';

// ============================================
// PAGOS ACADÉMICOS
// ============================================
export { ConfiguracionAporte } from './configuracion_aporte.js';
export { MetodoPago } from './metodo_pago.js';
export { BancoAutorizado } from './banco_autorizado.js';
export { CuentaPago } from './cuenta_pago.js';
export { PagoAporte } from './pago_aporte.js';
export { PagoCuotas } from './pago_cuotas.js';

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
export { ConfiguracionSistema } from './configuracion_sistema.js';
