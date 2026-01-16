/**
 * Módulo: Estudiantes
 * Registra todos los Use Cases relacionados con estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Registro de dependencias del módulo de estudiantes
 */

import { 
  ObtenerTodosEstudiantesUseCase,
  ObtenerEstudiantePorIdUseCase,
  ObtenerDatosRegistroEstudianteUseCase,
  ObtenerDatosGeograficosFiltradosUseCase,
  ObtenerDatosReferenciaFiltradosUseCase,
  CrearEstudianteUseCase,
  ActualizarEstudianteUseCase,
  BuscarEstudianteUseCase,
  ObtenerTodasBecasDescuentosUseCase,
  CrearAsignarBecaUseCase,
} from '@useCases/estudiantes';

// Repositorio principal
import EstudianteRepository from '@implementations/EstudianteRepository';
import BecaDescuentoRepository from '@implementations/BecaDescuentoRepository';
import EstudianteBecaRepository from '@infrastructure/repositories/EstudianteBecaRepository';

// Repositorios geográficos
import PaisRepository from '@implementations/PaisRepository';
import DepartamentoRepository from '@implementations/DepartamentoRepository';
import ProvinciaRepository from '@implementations/ProvinciaRepository';
import MunicipioRepository from '@implementations/MunicipioRepository';

// Repositorios de referencia
import IdiomaRepository from '@implementations/IdiomaRepository';
import EstadoCivilRepository from '@implementations/EstadoCivilRepository';
import TipoParentescoRepository from '@implementations/TipoParentescoRepository';
import DiscapacidadRepository from '@implementations/DiscapacidadRepository';
import DocumentacionRepository from '@implementations/DocumentacionRepository';

/**
 * Registra los Use Cases del módulo de estudiantes
 * @param {Object} factory - Factory de Use Cases
 * @returns {Object} Factory con los Use Cases registrados
 */
export function registerEstudiantesModule(factory) {
  // Repositorios singleton (stateless)
  const estudianteRepository = EstudianteRepository;
  
  // Repositorios geográficos
  const paisRepository = PaisRepository;
  const departamentoRepository = DepartamentoRepository;
  const provinciaRepository = ProvinciaRepository;
  const municipioRepository = MunicipioRepository;
  
  // Repositorios de referencia
  const idiomaRepository = IdiomaRepository;
  const estadoCivilRepository = EstadoCivilRepository;
  const tipoParentescoRepository = TipoParentescoRepository;
  const discapacidadRepository = DiscapacidadRepository;
  const documentacionRepository = DocumentacionRepository;

  // Registrar Use Cases
  factory.obtenerTodosEstudiantes = () => {
    return new ObtenerTodosEstudiantesUseCase(estudianteRepository);
  };

  factory.obtenerEstudiantePorId = () => {
    return new ObtenerEstudiantePorIdUseCase(estudianteRepository);
  };

  factory.obtenerDatosRegistroEstudiante = () => {
    return new ObtenerDatosRegistroEstudianteUseCase({
      paisRepository,
      idiomaRepository,
      estadoCivilRepository,
      documentacionRepository,
    });
  };

  factory.crearEstudiante = () => {
    return new CrearEstudianteUseCase(estudianteRepository);
  };

  factory.actualizarEstudiante = () => {
    return new ActualizarEstudianteUseCase(estudianteRepository);
  };

  factory.buscarEstudiante = () => {
    return new BuscarEstudianteUseCase(estudianteRepository);
  };

  // Use Case para datos geográficos filtrados (estructura política: departamentos, provincias, municipios)
  factory.obtenerDatosGeograficosFiltrados = () => {
    return new ObtenerDatosGeograficosFiltradosUseCase({
      departamentoRepository,
      provinciaRepository,
      municipioRepository,
    });
  };

  // Use Case para datos de referencia filtrados (discapacidades, tipos de parentesco)
  factory.obtenerDatosReferenciaFiltrados = () => {
    return new ObtenerDatosReferenciaFiltradosUseCase({
      discapacidadRepository,
      tipoParentescoRepository,
    });
  };

  // Use Case para obtener todas las becas y descuentos
  factory.obtenerTodasBecasDescuentos = () => {
    return new ObtenerTodasBecasDescuentosUseCase(BecaDescuentoRepository);
  };

  // Use Case para crear asignación de beca
  factory.crearAsignarBeca = () => {
    return new CrearAsignarBecaUseCase(EstudianteBecaRepository);
  };

  return factory;
}

