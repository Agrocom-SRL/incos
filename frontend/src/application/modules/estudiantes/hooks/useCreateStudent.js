/**
 * Hook personalizado: useCreateStudent
 * 
 * Single Responsibility: Solo maneja la creación de estudiantes
 * Usa apiClient para comunicarse con el backend
 */

import { useState } from 'react';
import apiClient from '@infrastructure/api/client.js';

export const useCreateStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createStudent = async (studentData) => {
    setLoading(true);
    setError(null);

    try {
      // Separar documentos del resto de los datos
      // El backend ahora maneja los documentos dinámicamente usando documentacion_id
      // Solo necesitamos separar los archivos para subirlos después
      const datosEstudiante = { ...studentData };
      const documentosEntregados = {}; // Para subida de archivos (usa docId)
      const archivosASubir = {}; // Para subida de archivos (usa docId)

      // Extraer archivos para subirlos después de crear el estudiante
      Object.keys(studentData).forEach((key) => {
        if (key.startsWith('documento') && key.endsWith('_archivo')) {
          // Extraer el ID de documentación del nombre del campo
          // Formato esperado: documento_{id}_archivo
          const docIdStr = key.replace('documento_', '').replace('_archivo', '');
          const docId = parseInt(docIdStr, 10); // Convertir a número
          
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
          }
          
          // Eliminar del body ya que los archivos se suben por separado
          delete datosEstudiante[key];
        } else if (key.startsWith('documento') && key.endsWith('_entregado')) {
          // Extraer el ID de documentación del nombre del campo
          // Formato esperado: documento_{id}_entregado
          const docIdStr = key.replace('documento_', '').replace('_entregado', '');
          const docId = parseInt(docIdStr, 10); // Convertir a número
          
          if (isNaN(docId)) {
            console.warn(`[useCreateStudent] No se pudo extraer ID numérico del campo: ${key}`);
            return;
          }
          
          if (studentData[key]) {
            documentosEntregados[docId] = true;
          }
          // Mantener en el body, el backend lo procesará
        }
      });

      // Crear estudiante con datos académicos y documentos marcados
      // El backend extrae los campos documento_{id}_entregado y los procesa usando la tabla documentacion
      const response = await apiClient.post('/v1/estudiantes', datosEstudiante);

      if (response.data?.success) {
        const estudianteId = response.data.data.id;

        // Subir archivos después de crear el estudiante
        const uploadPromises = [];
        Object.keys(archivosASubir).forEach((docId) => {
          if (documentosEntregados[docId] && archivosASubir[docId]) {
            const formData = new FormData();
            // Asegurar que documentacionId sea un número
            const documentacionId = typeof docId === 'string' ? parseInt(docId, 10) : docId;
            
            formData.append('archivo', archivosASubir[docId]);
            formData.append('documentacionId', documentacionId.toString());
            formData.append('esOriginal', 'false'); // Por defecto es copia, se puede cambiar después

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
          data: response.data.data,
          message: response.data.message,
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Error al crear el estudiante',
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

