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
} from '@useCases/configuracion/academico/paralelos';
import ParaleloRepository from '@infrastructure/repositories/ParaleloRepository';
import {
  GetTodasDiscapacidadesUseCase,
  GetDiscapacidadPorIdUseCase,
  CrearDiscapacidadUseCase,
  ActualizarDiscapacidadUseCase,
  EliminarDiscapacidadUseCase,
} from '@useCases/configuracion/complementario/discapacidad';
import {
  GetTodosTiposParentescoUseCase,
  GetTipoParentescoPorIdUseCase,
  CrearTipoParentescoUseCase,
  ActualizarTipoParentescoUseCase,
  EliminarTipoParentescoUseCase,
} from '@useCases/configuracion/complementario/tipoParentesco';
import {
  GetTodosIdiomasUseCase,
  GetIdiomaPorIdUseCase,
  CrearIdiomaUseCase,
  ActualizarIdiomaUseCase,
  EliminarIdiomaUseCase,
} from '@useCases/configuracion/complementario/idioma';
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
import CarreraRepository from '@infrastructure/repositories/CarreraRepository';
import MateriaRepository from '@infrastructure/repositories/MateriaRepository';
import DiscapacidadRepository from '@infrastructure/repositories/DiscapacidadRepository';
import TipoParentescoRepository from '@infrastructure/repositories/TipoParentescoRepository';
import IdiomaRepository from '@infrastructure/repositories/IdiomaRepository';
import DocumentacionRepository from '@infrastructure/repositories/DocumentacionRepository';
import ActividadRepository from '@infrastructure/repositories/ActividadRepository';

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
  const documentacionRepository = DocumentacionRepository;
  const actividadRepository = ActividadRepository;

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

  factory.obtenerTodasDiscapacidades = () => new GetTodasDiscapacidadesUseCase(discapacidadRepository);
  factory.obtenerDiscapacidadPorId = () => new GetDiscapacidadPorIdUseCase(discapacidadRepository);
  factory.crearDiscapacidad = () => new CrearDiscapacidadUseCase(discapacidadRepository);
  factory.actualizarDiscapacidad = () => new ActualizarDiscapacidadUseCase(discapacidadRepository);
  factory.eliminarDiscapacidad = () => new EliminarDiscapacidadUseCase(discapacidadRepository);

  factory.obtenerTodosTiposParentesco = () => new GetTodosTiposParentescoUseCase(tipoParentescoRepository);
  factory.obtenerTipoParentescoPorId = () => new GetTipoParentescoPorIdUseCase(tipoParentescoRepository);
  factory.crearTipoParentesco = () => new CrearTipoParentescoUseCase(tipoParentescoRepository);
  factory.actualizarTipoParentesco = () => new ActualizarTipoParentescoUseCase(tipoParentescoRepository);
  factory.eliminarTipoParentesco = () => new EliminarTipoParentescoUseCase(tipoParentescoRepository);

  factory.obtenerTodosIdiomas = () => new GetTodosIdiomasUseCase(idiomaRepository);
  factory.obtenerIdiomaPorId = () => new GetIdiomaPorIdUseCase(idiomaRepository);
  factory.crearIdioma = () => new CrearIdiomaUseCase(idiomaRepository);
  factory.actualizarIdioma = () => new ActualizarIdiomaUseCase(idiomaRepository);
  factory.eliminarIdioma = () => new EliminarIdiomaUseCase(idiomaRepository);

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

  return factory;
}
