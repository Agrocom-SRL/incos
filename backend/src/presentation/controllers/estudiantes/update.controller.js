import { logger } from '../../../shared/logger.js';
import { StudentRepository } from '../../../infrastructure/repositories/StudentRepository.js';
import { StudentAcademicDataRepository } from '../../../infrastructure/repositories/StudentAcademicDataRepository.js';
import { StudentMapper } from '../../../application/mappers/StudentMapper.js';
import { StudentResponseDTO } from '../../../application/dtos/response/StudentResponseDTO.js';

// Crear instancias de repositorios directamente
const studentRepository = new StudentRepository();
const studentAcademicDataRepository = new StudentAcademicDataRepository();

/**
 * PUT /api/v1/estudiantes/:id
 * Controller para actualizar datos de un estudiante
 */
export class UpdateStudentController {
  async handle(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de actualización de estudiante', {
        studentId: id,
        fields: Object.keys(updateData),
        sampleData: {
          nombres: updateData.nombres,
          apellidoPaterno: updateData.apellidoPaterno,
          ci: updateData.ci,
          celular: updateData.celular,
          carreraId: updateData.carreraId,
          gestionIngresoId: updateData.gestionIngresoId,
        },
        userId,
      });
      
      // Separar datos académicos del resto de los datos del estudiante
      const datosAcademicos = {};
      const camposAcademicos = [
        'carreraId',
        'gestionIngresoId',
        'unidadEducativaProcedencia',
        'anioEgresoSecundaria',
        'promedioAnual',
        'fechaEgreso',
        'fechaRetiro',
        'motivoRetiro',
        'estadoAcademico',
      ];
      
      camposAcademicos.forEach(campo => {
        if (updateData[campo] !== undefined) {
          datosAcademicos[campo] = updateData[campo];
        }
      });
      
      // Crear una copia de updateData sin los campos académicos para actualizar el estudiante
      const datosEstudiante = { ...updateData };
      camposAcademicos.forEach(campo => {
        delete datosEstudiante[campo];
      });
      
      logger.info('Datos separados', {
        tieneDatosAcademicos: Object.keys(datosAcademicos).length > 0,
        camposAcademicos: Object.keys(datosAcademicos),
        camposEstudiante: Object.keys(datosEstudiante),
      });

      // Verificar que el estudiante existe
      const estudianteId = parseInt(id, 10);
      if (isNaN(estudianteId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID de estudiante inválido',
          },
        });
      }

      const estudianteExistente = await studentRepository.findById(estudianteId);
      if (!estudianteExistente) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'STUDENT_NOT_FOUND',
            message: 'Estudiante no encontrado',
          },
        });
      }

      // Convertir datos del request (castellano) a formato de dominio (inglés)
      // Usar datosEstudiante (sin campos académicos) para el mapper
      const datosDominio = StudentMapper.toDomain(datosEstudiante);
      
      logger.info('Datos convertidos a dominio', {
        dominioFields: Object.keys(datosDominio),
        totalCampos: Object.keys(datosDominio).length,
        sampleDominio: {
          firstName: datosDominio.firstName,
          lastName: datosDominio.lastName,
          motherLastName: datosDominio.motherLastName,
          ci: datosDominio.ci,
          expedition: datosDominio.expedition,
          mobilePhone: datosDominio.mobilePhone,
          emailPersonal: datosDominio.personalEmail,
          birthDate: datosDominio.birthDate,
        },
      });

      // Verificar que hay datos para actualizar
      if (Object.keys(datosDominio).length === 0) {
        logger.warn('No hay datos para actualizar', {
          studentId: estudianteId,
          originalFields: Object.keys(updateData),
        });
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_DATA_TO_UPDATE',
            message: 'No se proporcionaron datos para actualizar',
          },
        });
      }

      // Actualizar el estudiante usando el repositorio
      logger.info('Llamando a studentRepository.update', {
        studentId: estudianteId,
        camposAActualizar: Object.keys(datosDominio),
      });
      
      const estudianteActualizado = await studentRepository.update(
        estudianteId,
        datosDominio,
        userId
      );
      
      logger.info('Repositorio update completado', {
        studentId: estudianteId,
        estudianteActualizado: !!estudianteActualizado,
        nuevoNombre: estudianteActualizado?.firstName,
      });

      if (!estudianteActualizado) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Error al actualizar el estudiante',
          },
        });
      }

      // Convertir entidad a DTO de respuesta
      const responseDTO = StudentResponseDTO.fromEntity(estudianteActualizado);

      logger.info('Estudiante actualizado correctamente', {
        studentId: estudianteId,
        updatedFields: Object.keys(datosDominio),
      });

      // Si hay datos académicos, guardarlos/actualizarlos
      if (Object.keys(datosAcademicos).length > 0) {
        try {
          // Buscar si ya existen datos académicos para este estudiante
          const datosAcademicosExistentes = await studentAcademicDataRepository.findByEstudianteId(estudianteId);
          
          // Mapear campos académicos de castellano a dominio
          const datosAcademicosDominio = {
            studentId: estudianteId,
            careerId: datosAcademicos.carreraId,
            managementId: datosAcademicos.gestionIngresoId,
            previousSchool: datosAcademicos.unidadEducativaProcedencia || null,
            highSchoolGraduationYear: datosAcademicos.anioEgresoSecundaria || null,
            annualAverage: datosAcademicos.promedioAnual || null,
            graduationDate: datosAcademicos.fechaEgreso || null,
            withdrawalDate: datosAcademicos.fechaRetiro || null,
            withdrawalReason: datosAcademicos.motivoRetiro || null,
            academicState: datosAcademicos.estadoAcademico || 'REGULAR',
          };
          
          // Limpiar campos undefined
          Object.keys(datosAcademicosDominio).forEach(key => {
            if (datosAcademicosDominio[key] === undefined) {
              delete datosAcademicosDominio[key];
            }
          });
          
          if (datosAcademicosExistentes) {
            // Actualizar datos académicos existentes
            logger.info('Actualizando datos académicos existentes', {
              studentId: estudianteId,
              academicDataId: datosAcademicosExistentes.id,
              camposAActualizar: Object.keys(datosAcademicosDominio),
            });
            
            await studentAcademicDataRepository.update(
              datosAcademicosExistentes.id,
              datosAcademicosDominio,
              userId
            );
            
            logger.info('Datos académicos actualizados correctamente', {
              studentId: estudianteId,
            });
          } else {
            // Crear nuevos datos académicos
            logger.info('Creando nuevos datos académicos', {
              studentId: estudianteId,
              camposACrear: Object.keys(datosAcademicosDominio),
            });
            
            await studentAcademicDataRepository.create(
              datosAcademicosDominio,
              userId
            );
            
            logger.info('Datos académicos creados correctamente', {
              studentId: estudianteId,
            });
          }
        } catch (academicError) {
          logger.error('Error al guardar datos académicos', {
            error: academicError.message,
            stack: academicError.stack,
            studentId: estudianteId,
            datosAcademicos: datosAcademicos,
          });
          // No fallar la actualización del estudiante si falla la de datos académicos
          // Solo loguear el error
        }
      }

      res.status(200).json({
        success: true,
        data: responseDTO,
        message: 'Estudiante actualizado correctamente',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error en UpdateStudentController', {
        error: error.message,
        stack: error.stack,
        studentId: req.params.id,
        body: req.body,
      });
      next(error);
    }
  }
}
