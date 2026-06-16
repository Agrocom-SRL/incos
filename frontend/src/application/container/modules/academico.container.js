/**
 * Módulo: Académico
 * Registra todos los Use Cases relacionados con el módulo académico
 * 
 * Clean Architecture:
 * - Application Layer: Registro de dependencias del módulo académico
 * 
 * Ubicación: application/container/modules
 * - Parte del módulo Académico
 * - Features: Paralelos, Gestiones
 */

import {
  GetAsignaturasSinCursoUseCase,
  GetCapacidadTurnoUseCase,
  GetParaleloHorariosUseCase,
  GetParalelosEstadoDashboardUseCase,
  GetTodosParalelosUseCase,
  PutParaleloHorariosUseCase,
  GetHorariosPendientesSidebarUseCase,
  GetHorariosPublicacionPlanesUseCase,
} from '@useCases/academico/paralelos';
import { GetTodasGestionesUseCase } from '@useCases/academico/gestiones';
import {
  GetPoliticaCatalogoUseCase,
  GetTiposEvaluacionUseCase,
  GuardarPoliticaInstitucionalUseCase,
  ListCoordinacionDocentesUseCase,
  ListMisCursosUseCase,
  ObtenerPoliticaInstitucionalUseCase,
  ObtenerRegistroNotasCursoUseCase,
} from '@useCases/academico/calificaciones';
import {
  ListCoordinacionAsistenciaDocentesUseCase,
  ListMisCursosAsistenciaUseCase,
  GetCalendarioAsistenciaUseCase,
  GetPlanillaAsistenciaSemanalUseCase,
  GuardarPlanillaAsistenciaUseCase,
  CerrarRegistroAsistenciaUseCase,
  ReabrirRegistroAsistenciaUseCase,
  CrearSesionEspecialUseCase,
  EliminarSesionEspecialUseCase,
} from '@useCases/academico/asistencia';
import ParaleloRepository from '@infrastructure/repositories/ParaleloRepository';
import GestionRepository from '@infrastructure/repositories/GestionRepository';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository';
import AsistenciaRepository from '@infrastructure/repositories/AsistenciaRepository';
import TipoEvaluacionRepository from '@infrastructure/repositories/TipoEvaluacionRepository';

/**
 * Registra los Use Cases del módulo académico
 * @param {Object} factory - Factory de Use Cases
 * @returns {Object} Factory con los Use Cases registrados
 */
export function registerAcademicoModule(factory) {
  // Repositorios singleton (stateless)
  const paraleloRepository = ParaleloRepository;
  const gestionRepository = GestionRepository;

  // Registrar Use Cases de Paralelos
  factory.obtenerTodosParalelos = () => {
    return new GetTodosParalelosUseCase(paraleloRepository);
  };

  factory.obtenerParaleloHorarios = () => {
    return new GetParaleloHorariosUseCase(paraleloRepository);
  };

  factory.persistirParaleloHorarios = () => {
    return new PutParaleloHorariosUseCase(paraleloRepository);
  };

  factory.obtenerParalelosEstadoDashboard = () => {
    return new GetParalelosEstadoDashboardUseCase(paraleloRepository);
  };

  factory.obtenerAsignaturasSinCurso = () => {
    return new GetAsignaturasSinCursoUseCase(paraleloRepository);
  };

  factory.obtenerCapacidadTurno = () => {
    return new GetCapacidadTurnoUseCase(paraleloRepository);
  };

  factory.obtenerHorariosPendientesSidebar = () => {
    return new GetHorariosPendientesSidebarUseCase(paraleloRepository);
  };

  factory.obtenerHorariosPublicacionPlanes = () => {
    return new GetHorariosPublicacionPlanesUseCase(paraleloRepository);
  };

  // Registrar Use Cases de Gestiones
  factory.obtenerTodasGestiones = () => {
    return new GetTodasGestionesUseCase(gestionRepository);
  };

  factory.listarCoordinacionCalificacionesDocentes = () => {
    return new ListCoordinacionDocentesUseCase(CalificacionRepository);
  };

  factory.listarMisCursosCalificaciones = () => {
    return new ListMisCursosUseCase(CalificacionRepository);
  };

  factory.listarCoordinacionAsistenciaDocentes = () => {
    return new ListCoordinacionAsistenciaDocentesUseCase(AsistenciaRepository);
  };

  factory.listarMisCursosAsistencia = () => {
    return new ListMisCursosAsistenciaUseCase(AsistenciaRepository);
  };

  factory.obtenerCalendarioAsistencia = () => {
    return new GetCalendarioAsistenciaUseCase(AsistenciaRepository);
  };

  factory.obtenerPlanillaAsistenciaSemanal = () => {
    return new GetPlanillaAsistenciaSemanalUseCase(AsistenciaRepository);
  };

  factory.guardarPlanillaAsistencia = () => {
    return new GuardarPlanillaAsistenciaUseCase(AsistenciaRepository);
  };

  factory.cerrarRegistroAsistencia = () => {
    return new CerrarRegistroAsistenciaUseCase(AsistenciaRepository);
  };

  factory.reabrirRegistroAsistencia = () => {
    return new ReabrirRegistroAsistenciaUseCase(AsistenciaRepository);
  };

  factory.crearSesionEspecialAsistencia = () => {
    return new CrearSesionEspecialUseCase(AsistenciaRepository);
  };

  factory.eliminarSesionEspecialAsistencia = () => {
    return new EliminarSesionEspecialUseCase(AsistenciaRepository);
  };

  factory.obtenerRegistroNotasCurso = () => {
    return new ObtenerRegistroNotasCursoUseCase(CalificacionRepository);
  };

  factory.obtenerPoliticaInstitucional = () => {
    return new ObtenerPoliticaInstitucionalUseCase(CalificacionRepository);
  };

  factory.guardarPoliticaInstitucional = () => {
    return new GuardarPoliticaInstitucionalUseCase(CalificacionRepository);
  };

  factory.obtenerTiposEvaluacion = () => {
    return new GetTiposEvaluacionUseCase(TipoEvaluacionRepository);
  };

  factory.obtenerPoliticaCatalogo = () => {
    return new GetPoliticaCatalogoUseCase(CalificacionRepository);
  };

  return factory;
}
