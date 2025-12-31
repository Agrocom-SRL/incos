/**
 * Use Case: Obtener Datos para Registro de Estudiante
 * 
 * Single Responsibility: Orquestar la obtención de todos los catálogos necesarios para el registro
 * Dependency Inversion: Depende de abstracciones de repositorios
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta múltiples repositorios)
 * 
 * Este Use Case obtiene SOLO los catálogos esenciales (siempre necesarios) para el formulario de registro:
 * - Catálogos geográficos: países (departamentos se cargan condicionalmente si es boliviano)
 * - Catálogos de referencia: idiomas, estados civiles, documentación de inscripción
 * 
 * Catálogos que NO se cargan aquí (se cargan bajo demanda cuando se necesitan):
 * - Departamentos: Solo si nacionalidad = "Boliviana" (usar obtenerCatalogo con departamentoRepository)
 * - Provincias: Solo cuando se selecciona departamento (usar obtenerProvinciasPorDepartamento)
 * - Municipios: Solo cuando se selecciona provincia (usar obtenerMunicipiosPorProvincia)
 * - Tipos de discapacidad: Solo si tiene discapacidad = true (usar obtenerCatalogo con discapacidadRepository)
 * - Tipos de parentesco: Solo si hay contacto de emergencia (usar obtenerCatalogo con tipoParentescoRepository)
 * 
 * Las llamadas se realizan en paralelo para optimizar el rendimiento.
 * 
 * Retorna un objeto con los catálogos esenciales organizados.
 */

export class ObtenerDatosRegistroEstudianteUseCase {
  /**
   * @param {Object} repositories - Repositorios necesarios (solo esenciales)
   * @param {IPaisRepository} repositories.paisRepository
   * @param {IIdiomaRepository} repositories.idiomaRepository
   * @param {IEstadoCivilRepository} repositories.estadoCivilRepository
   * @param {IDocumentacionRepository} repositories.documentacionRepository
   */
  constructor(repositories) {
    this.paisRepository = repositories.paisRepository;
    this.idiomaRepository = repositories.idiomaRepository;
    this.estadoCivilRepository = repositories.estadoCivilRepository;
    this.documentacionRepository = repositories.documentacionRepository;
  }

  /**
   * Ejecuta el caso de uso para obtener todos los datos de registro
   * 
   * @param {Object} options - Opciones opcionales
   * @param {Object} options.params - Parámetros adicionales para los repositorios (filtros, etc.)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   * 
   * Retorna:
   * {
   *   success: true,
   *   data: {
   *     paises: Array,
   *     idiomas: Array,
   *     estadosCiviles: Array,
   *     documentacion: Array (solo tipo INSCRIPCION)
   *   }
   * }
   * 
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      // Obtener solo los catálogos esenciales (siempre necesarios) en paralelo
      // Los catálogos condicionales se cargan bajo demanda usando otros Use Cases
      const [
        paisesResult,
        idiomasResult,
        estadosCivilesResult,
        documentacionResult,
      ] = await Promise.all([
        this.paisRepository.obtenerTodos({ params }),
        this.idiomaRepository.obtenerTodos({ params }),
        this.estadoCivilRepository.obtenerTodos({ params }),
        this.documentacionRepository.obtenerTodos({ params: { tipoDocumento: 'INSCRIPCION', ...params } }),
      ]);

      // Verificar si algún catálogo falló
      const resultados = [
        paisesResult,
        idiomasResult,
        estadosCivilesResult,
        documentacionResult,
      ];

      const errores = resultados.filter(r => !r.success);
      // En lugar de solo el primer error, podrías retornar todos
      if (errores.length > 0) {
        return {
          success: false,
          error: `Error al obtener catálogos: ${errores.map(e => e.error).join(', ')}`,
          errores: errores.map(e => e.error), // Lista de todos los errores
        };
      }

      // Retornar solo los catálogos esenciales
      // Los catálogos condicionales se cargan bajo demanda usando otros Use Cases
      return {
        success: true,
        data: {
          paises: paisesResult.data || [],
          idiomas: idiomasResult.data || [],
          estadosCiviles: estadosCivilesResult.data || [],
          documentacion: documentacionResult.data || [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener datos de registro',
      };
    }
  }
}

