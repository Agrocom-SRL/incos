/**
 * Use Case: ListStudentScholarshipsUseCase
 * Módulo: Estudiantes
 * Lista todas las becas asignadas a estudiantes con datos enriquecidos
 * 
 * Responsabilidades:
 * - Obtener todas las becas asignadas a estudiantes (estudiantes_becas)
 * - Enriquecer con datos del estudiante (nombres, CI, código)
 * - Enriquecer con datos del tipo de beca (becas_descuentos)
 * - Enriquecer con datos de la gestión
 * - Aplicar filtros y paginación
 * - Retornar lista enriquecida para el listado
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja el listado de becas asignadas
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */

import { StudentMapper } from '../../../mappers/estudiantes/index.js';
import { BecaDescuentoMapper } from '../../../mappers/estudiantes/index.js';
import { ManagementMapper } from '../../../mappers/academico/index.js';

export class ListStudentScholarshipsUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentScholarshipRepository - Repositorio de asignaciones de becas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.scholarshipRepository - Repositorio de becas/descuentos
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    studentScholarshipRepository,
    studentRepository,
    scholarshipRepository,
    managementRepository,
    logger,
  }) {
    this.studentScholarshipRepository = studentScholarshipRepository;
    this.studentRepository = studentRepository;
    this.scholarshipRepository = scholarshipRepository;
    this.managementRepository = managementRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso de listado de becas asignadas
   * 
   * @param {Object} filters - Filtros opcionales (studentId, managementId, state, etc.)
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Límite por página (default: 50)
   * @param {Object} queryParams - Query parameters originales (para búsqueda)
   * @returns {Promise<Object>} Lista de becas asignadas con datos enriquecidos
   */
  async execute(filters = {}, page = 1, limit = 50, queryParams = {}) {
    this.logger.info('[Estudiantes] Iniciando listado de becas asignadas', {
      filters,
      page,
      limit,
    });

    try {
      // 1. Construir filtros de búsqueda si hay search en queryParams
      const searchTerm = queryParams.search || filters.search;
      const finalFilters = { ...filters };
      
      // Si hay búsqueda, se aplicará después en el enriquecimiento
      if (searchTerm) {
        delete finalFilters.search;
      }

      // 2. Obtener todas las becas asignadas con paginación
      const scholarshipsResult = await this.studentScholarshipRepository.findAll(
        finalFilters,
        page,
        limit
      );
      const scholarships = scholarshipsResult.studentScholarships || [];
      const total = scholarshipsResult.total || 0;

      this.logger.info('[Estudiantes] Becas asignadas encontradas', {
        count: scholarships.length,
        total,
      });

      // 3. Obtener IDs únicos para enriquecer datos
      const studentIds = new Set();
      const scholarshipIds = new Set();
      const managementIds = new Set();
      
      scholarships.forEach((scholarship) => {
        const scholarshipPlain = scholarship.toPlainObject ? scholarship.toPlainObject() : scholarship;
        if (scholarshipPlain.studentId) studentIds.add(scholarshipPlain.studentId);
        if (scholarshipPlain.scholarshipId) scholarshipIds.add(scholarshipPlain.scholarshipId);
        if (scholarshipPlain.managementId) managementIds.add(scholarshipPlain.managementId);
      });

      // 4. Obtener datos de estudiantes y convertir a formato de presentación
      const students = {};
      for (const studentId of studentIds) {
        try {
          const student = await this.studentRepository.findById(studentId);
          if (student) {
            // Convertir entidad a formato de presentación usando el mapper
            const studentPresentation = StudentMapper.entityToPresentation(student);
            students[studentId] = studentPresentation;
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener estudiante', {
            studentId,
            error: err.message,
          });
        }
      }

      // 5. Obtener tipos de beca y convertir a formato de presentación
      const scholarshipsCatalog = {};
      for (const scholarshipId of scholarshipIds) {
        try {
          const scholarship = await this.scholarshipRepository.findById(scholarshipId);
          if (scholarship) {
            // Convertir entidad a formato de presentación usando el mapper
            const scholarshipPresentation = BecaDescuentoMapper.entityToPresentation(scholarship);
            scholarshipsCatalog[scholarshipId] = scholarshipPresentation;
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener tipo de beca', {
            scholarshipId,
            error: err.message,
          });
        }
      }

      // 6. Obtener gestiones y convertir a formato de presentación
      const managements = {};
      for (const managementId of managementIds) {
        try {
          const management = await this.managementRepository.findById(managementId);
          if (management) {
            // Convertir entidad a formato de presentación usando el mapper
            const managementPresentation = ManagementMapper.entityToPresentation(management);
            managements[managementId] = managementPresentation;
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener gestión', {
            managementId,
            error: err.message,
          });
        }
      }

      // 7. Enriquecer becas con información relacionada
      let enrichedScholarships = scholarships.map((scholarship) => {
        const scholarshipPlain = scholarship.toPlainObject ? scholarship.toPlainObject() : scholarship;
        const student = scholarshipPlain.studentId ? students[scholarshipPlain.studentId] : null;
        const scholarshipType = scholarshipPlain.scholarshipId 
          ? scholarshipsCatalog[scholarshipPlain.scholarshipId] 
          : null;
        const management = scholarshipPlain.managementId 
          ? managements[scholarshipPlain.managementId] 
          : null;
        
        // Construir nombre completo del estudiante
        // Los datos ya están en formato de presentación (español) gracias a los mappers
        const nombres = student?.nombres || '';
        const apellidoPaterno = student?.apellidoPaterno || '';
        const apellidoMaterno = student?.apellidoMaterno || '';
        const nombreCompleto = student 
          ? `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.trim()
          : null;

        return {
          // Datos de la asignación
          id: scholarshipPlain.id,
          studentId: scholarshipPlain.studentId,
          scholarshipId: scholarshipPlain.scholarshipId,
          managementId: scholarshipPlain.managementId,
          requestDate: scholarshipPlain.requestDate || scholarshipPlain.fechaSolicitud,
          state: scholarshipPlain.state || scholarshipPlain.estado,
          documentsComplete: scholarshipPlain.documentsComplete || scholarshipPlain.documentosCompletos,
          documentDeliveryStartDate: scholarshipPlain.documentDeliveryStartDate || scholarshipPlain.fechaInicioEntregaDocumentos,
          documentDeliveryEndDate: scholarshipPlain.documentDeliveryEndDate || scholarshipPlain.fechaFinEntregaDocumentos,
          observations: scholarshipPlain.observations,
          createdAt: scholarshipPlain.createdAt,
          updatedAt: scholarshipPlain.updatedAt,
          
          // Datos del estudiante (ya en formato de presentación gracias al mapper)
          student: student ? {
            id: student.id,
            codigoEstudiante: student.codigoEstudiante,
            nombreCompleto,
            ci: student.ci,
            expedicion: student.expedicion,
          } : null,
          
          // Datos del tipo de beca (ya en formato de presentación gracias al mapper)
          scholarship: scholarshipType ? {
            id: scholarshipType.id,
            nombre: scholarshipType.nombre,
            codigo: scholarshipType.codigo,
            porcentaje: scholarshipType.porcentaje,
            descripcion: scholarshipType.descripcion,
            requiereDocumentacion: scholarshipType.requiereDocumentacion,
            requiereAprobacionRector: scholarshipType.requiereAprobacionRector,
            esAutomatica: scholarshipType.esAutomatica,
            tipoAutomatica: scholarshipType.tipoAutomatica,
            promedioMinimo: scholarshipType.promedioMinimo,
          } : null,
          
          // Datos de la gestión (ya en formato de presentación gracias al mapper)
          management: management ? {
            id: management.id,
            codigo: management.codigo,
            nombre: management.nombre,
            anio: management.anio,
          } : null,
        };
      });

      // 8. Aplicar filtro de búsqueda si existe
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        enrichedScholarships = enrichedScholarships.filter((item) => {
          const studentName = item.student?.nombreCompleto?.toLowerCase() || '';
          const studentCode = item.student?.codigoEstudiante?.toLowerCase() || '';
          const studentCi = item.student?.ci?.toLowerCase() || '';
          const scholarshipName = item.scholarship?.nombre?.toLowerCase() || '';
          const scholarshipCode = item.scholarship?.codigo?.toLowerCase() || '';
          const managementCode = item.management?.codigo?.toLowerCase() || '';
          
          return studentName.includes(searchLower) ||
                 studentCode.includes(searchLower) ||
                 studentCi.includes(searchLower) ||
                 scholarshipName.includes(searchLower) ||
                 scholarshipCode.includes(searchLower) ||
                 managementCode.includes(searchLower);
        });
        
        // Recalcular total después del filtro
        const totalAfterSearch = enrichedScholarships.length;
        this.logger.info('[Estudiantes] Búsqueda aplicada', {
          searchTerm,
          totalBefore: total,
          totalAfter: totalAfterSearch,
        });
      }

      // 9. Calcular total de páginas
      const totalPages = Math.ceil((searchTerm ? enrichedScholarships.length : total) / limit);

      // 10. Retornar respuesta estandarizada
      const result = {
        becas: enrichedScholarships,
        total: searchTerm ? enrichedScholarships.length : total,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        totalPages,
      };

      this.logger.info('[Estudiantes] Becas asignadas listadas exitosamente', {
        count: enrichedScholarships.length,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });

      return result;
    } catch (error) {
      this.logger.error('[Estudiantes] Error al listar becas asignadas', {
        error: error.message,
        stack: error.stack,
        filters,
        page,
        limit,
      });
      throw error;
    }
  }
}
