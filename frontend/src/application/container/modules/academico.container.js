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
  GetParaleloCursosOfertaUseCase,
  CrearParaleloCursoOfertaUseCase,
  GetParaleloHorariosUseCase,
  GetParalelosEstadoDashboardUseCase,
  GetTodosParalelosUseCase,
  PutParaleloHorariosUseCase,
  GetAulasHorariosUseCase,
  PatchAulaHorarioUseCase,
  GetHorariosPendientesSidebarUseCase,
  GetHorariosPublicacionPlanesUseCase,
} from '@useCases/academico/paralelos';
import { ActualizarCursoOfertaUseCase, EliminarCursoOfertaUseCase } from '@useCases/academico/cursos';
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
import ParaleloRepository from '@infrastructure/repositories/ParaleloRepository';
import CursoRepository from '@infrastructure/repositories/CursoRepository';
import GestionRepository from '@infrastructure/repositories/GestionRepository';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository';
import TipoEvaluacionRepository from '@infrastructure/repositories/TipoEvaluacionRepository';

/**
 * Registra los Use Cases del módulo académico
 * @param {Object} factory - Factory de Use Cases
 * @returns {Object} Factory con los Use Cases registrados
 */
export function registerAcademicoModule(factory) {
  // Repositorios singleton (stateless)
  const paraleloRepository = ParaleloRepository;
  const cursoRepository = CursoRepository;
  const gestionRepository = GestionRepository;

  // Registrar Use Cases de Paralelos
  factory.obtenerTodosParalelos = () => {
    return new GetTodosParalelosUseCase(paraleloRepository);
  };

  factory.obtenerParaleloHorarios = () => {
    return new GetParaleloHorariosUseCase(paraleloRepository);
  };

  factory.obtenerParaleloCursosOferta = () => {
    return new GetParaleloCursosOfertaUseCase(paraleloRepository);
  };

  factory.crearParaleloCursoOferta = () => {
    return new CrearParaleloCursoOfertaUseCase(paraleloRepository);
  };

  factory.actualizarCursoOferta = () => {
    return new ActualizarCursoOfertaUseCase(cursoRepository);
  };

  factory.eliminarCursoOferta = () => {
    return new EliminarCursoOfertaUseCase(cursoRepository);
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

  factory.obtenerAulasHorarios = () => {
    return new GetAulasHorariosUseCase(paraleloRepository);
  };

  factory.asignarAulaHorario = () => {
    return new PatchAulaHorarioUseCase(paraleloRepository);
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
