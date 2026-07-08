/**
 * Módulo: Configuración
 * Registra todos los Use Cases relacionados con configuración (académico, datos complementarios)
 */

import {
  GetTodasCarrerasUseCase,
  GetCarreraPorIdUseCase,
  CrearCarreraUseCase,
  ActualizarCarreraUseCase,
  EliminarCarreraUseCase,
  SubirCarreraImagenUseCase,
} from '@useCases/configuracion/academico/carreras';
import {
  GetTodasMateriasUseCase,
  GetMateriaPorIdUseCase,
  CrearMateriaUseCase,
  ActualizarMateriaUseCase,
  EliminarMateriaUseCase,
} from '@useCases/configuracion/academico/materias';
import {
  GetParaleloPorIdUseCase,
  CrearParaleloUseCase,
  ActualizarParaleloUseCase,
  EliminarParaleloUseCase,
  CambiarEstadoParaleloUseCase,
} from '@useCases/configuracion/recursos/paralelos';
import ParaleloRepository from '@infrastructure/repositories/ParaleloRepository';
import {
  GetTodasDiscapacidadesUseCase,
  GetDiscapacidadPorIdUseCase,
  CrearDiscapacidadUseCase,
  ActualizarDiscapacidadUseCase,
  EliminarDiscapacidadUseCase,
  CambiarEstadoDiscapacidadUseCase,
} from '@useCases/configuracion/complementario/discapacidad';
import {
  GetTodosTiposParentescoUseCase,
  GetTipoParentescoPorIdUseCase,
  CrearTipoParentescoUseCase,
  ActualizarTipoParentescoUseCase,
  EliminarTipoParentescoUseCase,
  CambiarEstadoTipoParentescoUseCase,
} from '@useCases/configuracion/complementario/tipoParentesco';
import {
  GetTodosIdiomasUseCase,
  GetIdiomaPorIdUseCase,
  CrearIdiomaUseCase,
  ActualizarIdiomaUseCase,
  EliminarIdiomaUseCase,
  CambiarEstadoIdiomaUseCase,
} from '@useCases/configuracion/complementario/idioma';
import {
  GetTodosEstadosCivilesUseCase,
  GetEstadoCivilPorIdUseCase,
  CrearEstadoCivilUseCase,
  ActualizarEstadoCivilUseCase,
  EliminarEstadoCivilUseCase,
  CambiarEstadoEstadoCivilUseCase,
} from '@useCases/configuracion/complementario/estadoCivil';
import {
  GetTodaDocumentacionUseCase,
  GetDocumentacionPorIdUseCase,
  CrearDocumentacionUseCase,
  ActualizarDocumentacionUseCase,
  EliminarDocumentacionUseCase,
} from '@useCases/configuracion/documentacion';
import {
  GetTodasActividadesUseCase,
  GetActividadPorIdUseCase,
  CrearActividadUseCase,
  ActualizarActividadUseCase,
  EliminarActividadUseCase,
} from '@useCases/configuracion/actividades';
import {
  GetTodasAulasUseCase,
  GetAulaPorIdUseCase,
  CrearAulaUseCase,
  ActualizarAulaUseCase,
  EliminarAulaUseCase,
  CambiarEstadoAulaUseCase,
} from '@useCases/configuracion/recursos/aula';
import {
  GetTodosTiposEvaluacionUseCase,
  GetTipoEvaluacionPorIdUseCase,
  CrearTipoEvaluacionUseCase,
  ActualizarTipoEvaluacionUseCase,
  EliminarTipoEvaluacionUseCase,
  CambiarEstadoTipoEvaluacionUseCase,
} from '@useCases/configuracion/recursos/tipoEvaluacion';
import CarreraRepository from '@infrastructure/repositories/CarreraRepository';
import MateriaRepository from '@infrastructure/repositories/MateriaRepository';
import DiscapacidadRepository from '@infrastructure/repositories/DiscapacidadRepository';
import TipoParentescoRepository from '@infrastructure/repositories/TipoParentescoRepository';
import IdiomaRepository from '@infrastructure/repositories/IdiomaRepository';
import EstadoCivilRepository from '@infrastructure/repositories/EstadoCivilRepository';
import DocumentacionRepository from '@infrastructure/repositories/DocumentacionRepository';
import ActividadRepository from '@infrastructure/repositories/ActividadRepository';
import AulaRepository from '@infrastructure/repositories/AulaRepository';
import TipoEvaluacionAdminRepository from '@infrastructure/repositories/TipoEvaluacionAdminRepository';

/**
 * Registra los Use Cases del módulo de configuración académica
 * @param {Object} factory - Factory de Use Cases
 * @returns {Object} Factory con los Use Cases registrados
 */
export function registerConfiguracionModule(factory) {
  const carreraRepository = CarreraRepository;
  const materiaRepository = MateriaRepository;
  const discapacidadRepository = DiscapacidadRepository;
  const tipoParentescoRepository = TipoParentescoRepository;
  const idiomaRepository = IdiomaRepository;
  const estadoCivilRepository = EstadoCivilRepository;
  const documentacionRepository = DocumentacionRepository;
  const actividadRepository = ActividadRepository;
  const aulaRepository = AulaRepository;
  const tipoEvaluacionAdminRepository = TipoEvaluacionAdminRepository;

  factory.obtenerTodasCarreras = () => new GetTodasCarrerasUseCase(carreraRepository);
  factory.obtenerCarreraPorId = () => new GetCarreraPorIdUseCase(carreraRepository);
  factory.crearCarrera = () => new CrearCarreraUseCase(carreraRepository);
  factory.actualizarCarrera = () => new ActualizarCarreraUseCase(carreraRepository);
  factory.eliminarCarrera = () => new EliminarCarreraUseCase(carreraRepository);
  factory.subirCarreraImagen = () => new SubirCarreraImagenUseCase(carreraRepository);

  factory.obtenerTodasMaterias = () => new GetTodasMateriasUseCase(materiaRepository);
  factory.obtenerMateriaPorId = () => new GetMateriaPorIdUseCase(materiaRepository);
  factory.crearMateria = () => new CrearMateriaUseCase(materiaRepository);
  factory.actualizarMateria = () => new ActualizarMateriaUseCase(materiaRepository);
  factory.eliminarMateria = () => new EliminarMateriaUseCase(materiaRepository);

  const paraleloRepository = ParaleloRepository;
  factory.obtenerParaleloPorId = () => new GetParaleloPorIdUseCase(paraleloRepository);
  factory.crearParalelo = () => new CrearParaleloUseCase(paraleloRepository);
  factory.actualizarParalelo = () => new ActualizarParaleloUseCase(paraleloRepository);
  factory.eliminarParalelo = () => new EliminarParaleloUseCase(paraleloRepository);
  factory.cambiarEstadoParalelo = () => new CambiarEstadoParaleloUseCase(paraleloRepository);

  factory.obtenerTodasDiscapacidades = () => new GetTodasDiscapacidadesUseCase(discapacidadRepository);
  factory.obtenerDiscapacidadPorId = () => new GetDiscapacidadPorIdUseCase(discapacidadRepository);
  factory.crearDiscapacidad = () => new CrearDiscapacidadUseCase(discapacidadRepository);
  factory.actualizarDiscapacidad = () => new ActualizarDiscapacidadUseCase(discapacidadRepository);
  factory.eliminarDiscapacidad = () => new EliminarDiscapacidadUseCase(discapacidadRepository);
  factory.cambiarEstadoDiscapacidad = () => new CambiarEstadoDiscapacidadUseCase(discapacidadRepository);

  factory.obtenerTodosTiposParentesco = () => new GetTodosTiposParentescoUseCase(tipoParentescoRepository);
  factory.obtenerTipoParentescoPorId = () => new GetTipoParentescoPorIdUseCase(tipoParentescoRepository);
  factory.crearTipoParentesco = () => new CrearTipoParentescoUseCase(tipoParentescoRepository);
  factory.actualizarTipoParentesco = () => new ActualizarTipoParentescoUseCase(tipoParentescoRepository);
  factory.eliminarTipoParentesco = () => new EliminarTipoParentescoUseCase(tipoParentescoRepository);
  factory.cambiarEstadoTipoParentesco = () => new CambiarEstadoTipoParentescoUseCase(tipoParentescoRepository);

  factory.obtenerTodosIdiomas = () => new GetTodosIdiomasUseCase(idiomaRepository);
  factory.obtenerIdiomaPorId = () => new GetIdiomaPorIdUseCase(idiomaRepository);
  factory.crearIdioma = () => new CrearIdiomaUseCase(idiomaRepository);
  factory.actualizarIdioma = () => new ActualizarIdiomaUseCase(idiomaRepository);
  factory.eliminarIdioma = () => new EliminarIdiomaUseCase(idiomaRepository);
  factory.cambiarEstadoIdioma = () => new CambiarEstadoIdiomaUseCase(idiomaRepository);

  factory.obtenerTodosEstadosCiviles = () => new GetTodosEstadosCivilesUseCase(estadoCivilRepository);
  factory.obtenerEstadoCivilPorId = () => new GetEstadoCivilPorIdUseCase(estadoCivilRepository);
  factory.crearEstadoCivil = () => new CrearEstadoCivilUseCase(estadoCivilRepository);
  factory.actualizarEstadoCivil = () => new ActualizarEstadoCivilUseCase(estadoCivilRepository);
  factory.eliminarEstadoCivil = () => new EliminarEstadoCivilUseCase(estadoCivilRepository);
  factory.cambiarEstadoEstadoCivil = () => new CambiarEstadoEstadoCivilUseCase(estadoCivilRepository);

  factory.obtenerTodaDocumentacion = () => new GetTodaDocumentacionUseCase(documentacionRepository);
  factory.obtenerDocumentacionPorId = () => new GetDocumentacionPorIdUseCase(documentacionRepository);
  factory.crearDocumentacion = () => new CrearDocumentacionUseCase(documentacionRepository);
  factory.actualizarDocumentacion = () => new ActualizarDocumentacionUseCase(documentacionRepository);
  factory.eliminarDocumentacion = () => new EliminarDocumentacionUseCase(documentacionRepository);

  factory.obtenerTodasActividades = () => new GetTodasActividadesUseCase(actividadRepository);
  factory.obtenerActividadPorId = () => new GetActividadPorIdUseCase(actividadRepository);
  factory.crearActividad = () => new CrearActividadUseCase(actividadRepository);
  factory.actualizarActividad = () => new ActualizarActividadUseCase(actividadRepository);
  factory.eliminarActividad = () => new EliminarActividadUseCase(actividadRepository);

  factory.obtenerTodasAulas = () => new GetTodasAulasUseCase(aulaRepository);
  factory.obtenerAulaPorId = () => new GetAulaPorIdUseCase(aulaRepository);
  factory.crearAula = () => new CrearAulaUseCase(aulaRepository);
  factory.actualizarAula = () => new ActualizarAulaUseCase(aulaRepository);
  factory.eliminarAula = () => new EliminarAulaUseCase(aulaRepository);
  factory.cambiarEstadoAula = () => new CambiarEstadoAulaUseCase(aulaRepository);

  factory.obtenerTodosTiposEvaluacion = () =>
    new GetTodosTiposEvaluacionUseCase(tipoEvaluacionAdminRepository);
  factory.obtenerTipoEvaluacionPorId = () =>
    new GetTipoEvaluacionPorIdUseCase(tipoEvaluacionAdminRepository);
  factory.crearTipoEvaluacion = () => new CrearTipoEvaluacionUseCase(tipoEvaluacionAdminRepository);
  factory.actualizarTipoEvaluacion = () =>
    new ActualizarTipoEvaluacionUseCase(tipoEvaluacionAdminRepository);
  factory.eliminarTipoEvaluacion = () =>
    new EliminarTipoEvaluacionUseCase(tipoEvaluacionAdminRepository);
  factory.cambiarEstadoTipoEvaluacion = () =>
    new CambiarEstadoTipoEvaluacionUseCase(tipoEvaluacionAdminRepository);

  return factory;
}
