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

  const createStudent = async (studentData, documentacionInscripcion = []) => {
    setLoading(true);
    setError(null);

    try {
      // Separar documentos del resto de los datos
      // El backend ahora separa entregas físicas (estudiantes_documentos_entrega) de archivos digitales (documentos_estudiante)
      // Los checkboxes documento_{id}_entregado se procesan en el backend para crear entregas
      // Los archivos documento_{id}_archivo se suben después como archivos digitales
      const datosEstudiante = { ...studentData };
      const documentosEntregados = {}; // Para tracking de entregas (usa docId)
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
            // Guardar info de documentación para usar al subir
            if (documentacionMap[docId]) {
              documentosInfo[docId] = documentacionMap[docId];
            }
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
            // Guardar info de documentación si no está ya guardada
            if (!documentosInfo[docId] && documentacionMap[docId]) {
              documentosInfo[docId] = documentacionMap[docId];
            }
          }
          // Mantener en el body, el backend lo procesará para crear entregas en estudiantes_documentos_entrega
        }
      });

      // Crear estudiante con datos académicos y documentos marcados
      // El backend extrae los campos documento_{id}_entregado y los procesa usando la tabla documentacion
      const response = await apiClient.post('/v1/estudiantes', datosEstudiante);

      if (response.data?.success) {
        const estudianteId = response.data.data.id;

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

