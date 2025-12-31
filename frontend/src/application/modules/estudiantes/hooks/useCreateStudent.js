/**
 * Hook: useCreateStudent
 * 
 * Single Responsibility: Manejar la creación de estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la creación usando Use Cases
 * - Transforma datos del formulario al formato esperado por el backend
 * - Maneja subida de archivos y documentos
 * 
 * Este hook:
 * - Usa CrearEstudianteUseCase para crear el estudiante
 * - Separa documentos entregados de archivos digitales
 * - Sube archivos digitales después de crear el estudiante
 * - Maneja errores de validación del backend
 */

import { useState } from 'react';
import { useCasesFactory } from '@container';
import apiClient from '@api-client';

export const useCreateStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Crea un nuevo estudiante
   * 
   * @param {Object} studentData - Datos del estudiante del formulario
   * @param {Array} documentacionInscripcion - Lista de documentación de inscripción (para obtener tipoDocumento)
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Object}>}
   */
  const createStudent = async (studentData, documentacionInscripcion = []) => {
    setLoading(true);
    setError(null);

    try {
      // Separar documentos del resto de los datos
      // El backend separa entregas físicas (estudiantes_documentos_entrega) de archivos digitales (documentos_estudiante)
      // Los checkboxes documento_{id}_entregado se procesan en el backend para crear entregas
      // Los archivos documento_{id}_archivo se suben después como archivos digitales
      const datosEstudiante = { ...studentData };
      const archivosASubir = {}; // Para subida de archivos digitales (usa docId)
      const documentosInfo = {}; // Para almacenar info de documentación (tipoDocumento, etc.)

      // Crear mapa de documentación para acceso rápido
      const documentacionMap = {};
      if (Array.isArray(documentacionInscripcion)) {
        documentacionInscripcion.forEach((doc) => {
          documentacionMap[doc.id] = doc;
        });
      }

      // Extraer archivos y documentos entregados
      Object.keys(studentData).forEach((key) => {
        if (key.startsWith('documento') && key.endsWith('_archivo')) {
          // Extraer el ID de documentación del nombre del campo
          // Formato esperado: documento_{id}_archivo
          const docIdStr = key.replace('documento_', '').replace('_archivo', '');
          const docId = parseInt(docIdStr, 10);

          if (isNaN(docId)) {
            console.warn(`[useCreateStudent] No se pudo extraer ID numérico del campo: ${key}`);
            return;
          }

          const fieldValue = studentData[key];

          // El campo puede venir como array de archivos o como objeto con fileList
          let fileObj = null;
          if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            // Si es un array directo
            fileObj = fieldValue[0]?.originFileObj || fieldValue[0];
          } else if (fieldValue?.fileList && Array.isArray(fieldValue.fileList) && fieldValue.fileList.length > 0) {
            // Si es un objeto con fileList (formato Ant Design Upload)
            fileObj = fieldValue.fileList[0]?.originFileObj || fieldValue.fileList[0];
          }

          if (fileObj) {
            archivosASubir[docId] = fileObj;
            // Guardar info de documentación para usar al subir
            if (documentacionMap[docId]) {
              documentosInfo[docId] = documentacionMap[docId];
            }
          }

          // Eliminar del body ya que los archivos se suben por separado
          delete datosEstudiante[key];
        }
        // Los campos documento_{id}_entregado se mantienen en datosEstudiante
        // El backend los procesará para crear entregas en estudiantes_documentos_entrega
      });

      // Crear estudiante usando el Use Case
      const crearEstudianteUseCase = useCasesFactory.crearEstudiante();
      const result = await crearEstudianteUseCase.ejecutar(datosEstudiante);

      if (!result.success) {
        // Si hay errores de validación, retornarlos
        if (result.validationErrors) {
          return {
            success: false,
            error: result.error || 'Error de validación',
            validationErrors: result.validationErrors,
          };
        }

        return {
          success: false,
          error: result.error || 'Error al crear el estudiante',
        };
      }

      const estudianteId = result.data?.id;

      if (!estudianteId) {
        return {
          success: false,
          error: 'No se recibió el ID del estudiante creado',
        };
      }

      // Subir archivos digitales después de crear el estudiante
      // IMPORTANTE: Los documentos ya fueron marcados como entregados en el backend (estudiantes_documentos_entrega)
      // Ahora subimos los archivos digitales (documentos_estudiante)
      const uploadPromises = [];
      Object.keys(archivosASubir).forEach((docId) => {
        if (archivosASubir[docId]) {
          const formData = new FormData();
          const documentacionId = typeof docId === 'string' ? parseInt(docId, 10) : docId;
          const docInfo = documentosInfo[docId];

          if (!docInfo) {
            console.warn(`[useCreateStudent] No se encontró información de documentación para ID ${docId}, saltando subida`);
            return;
          }

          // Obtener tipoDocumento de la documentación
          const tipoDocumento = docInfo.tipoDocumento || 'INSCRIPCION';

          formData.append('archivo', archivosASubir[docId]);
          formData.append('tipoDocumento', tipoDocumento);
          formData.append('documentacionId', documentacionId.toString());
          formData.append('contieneMultipleDocumentos', 'false'); // Por defecto un archivo = un documento

          uploadPromises.push(
            apiClient.post(`/v1/estudiantes/${estudianteId}/documentos`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }).catch((err) => {
              console.error(`Error al subir documento ${docId}:`, err);
              return null; // Continuar con otros documentos aunque falle uno
            })
          );
        }
      });

      // Esperar a que se suban todos los documentos (o fallen)
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      return {
        success: true,
        data: result.data,
        message: 'Estudiante creado correctamente',
      };
    } catch (err) {
      // Manejo de errores de validación del servidor
      if (err.response?.data?.error?.details) {
        const validationErrors = err.response.data.error.details.reduce(
          (acc, error) => {
            acc[error.field] = error.message;
            return acc;
          },
          {}
        );
        return {
          success: false,
          error: err.response.data.error.message || 'Error de validación',
          validationErrors,
        };
      }

      const errorMessage = err.response?.data?.error?.message ||
                          err.message ||
                          'Error inesperado al crear el estudiante';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    createStudent,
    loading,
    error,
  };
};

