/**
 * Hook personalizado: useUpdateStudent
 * 
 * Single Responsibility: Solo maneja la actualización de estudiantes
 * Usa apiClient para comunicarse con el backend
 */

import { useState } from 'react';
import apiClient from '@infrastructure/api/client.js';

export const useUpdateStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateStudent = async (studentId, studentData, step = null, isFinalStep = false, isTemporarySave = false) => {
    setLoading(true);
    setError(null);

    try {
      // Separar documentos del resto de los datos
      // El backend ahora maneja los documentos dinámicamente usando documentacion_id
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
            console.warn(`[useUpdateStudent] No se pudo extraer ID numérico del campo: ${key}`);
            return;
          }
          
          const fieldValue = studentData[key];
          let fileObj = null;
          
          // El campo puede venir como array de archivos o como objeto con fileList
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
            console.warn(`[useUpdateStudent] No se pudo extraer ID numérico del campo: ${key}`);
            return;
          }
          
          if (studentData[key]) {
            documentosEntregados[docId] = true;
          }
          // Mantener en el body, el backend lo procesará
        }
      });

      // Si es un guardado temporal y ya hay un estudiante, no actualizar en el backend
      // Solo guardar localmente (el progreso se guardará cuando se finalice el registro)
      if (isTemporarySave && studentId) {
        return {
          success: true,
          message: 'Progreso guardado localmente',
          studentId,
        };
      }

      // Verificar si hay un estudianteId en los datos (viene de la URL cuando se completa registro)
      const estudianteIdEnDatos = studentData.estudianteId || studentData.id;
      // Priorizar: studentId (parámetro) > estudianteIdEnDatos (de los datos)
      const studentIdFinal = studentId || estudianteIdEnDatos;

      // Si no hay estudiante creado, crear el estudiante (independientemente del paso)
      // Esto puede ocurrir si el usuario avanzó usando "Siguiente" sin presionar "Guardar y Continuar Después"
      // O cuando se presiona "Guardar y Continuar Después" en el primer paso
      // IMPORTANTE: Si hay studentIdFinal, significa que el estudiante ya existe y debemos ACTUALIZAR
      if (!studentIdFinal) {
        // Si es un guardado parcial, indicar al backend que no valide documentos requeridos
        if (isTemporarySave) {
          datosEstudiante.skipDocumentValidation = true;
        }
        
        // El backend extrae los campos documento_{id}_entregado y los procesa usando la tabla documentacion
        const response = await apiClient.post('/v1/estudiantes', datosEstudiante);

        if (response.data?.success) {
          const nuevoEstudianteId = response.data.data.id;

          // Subir archivos después de crear el estudiante de forma SECUENCIAL
          // IMPORTANTE: Si hay un archivo, subirlo aunque el checkbox no esté marcado
          // El hecho de subir un archivo implica que el documento está entregado
          const docIds = Object.keys(archivosASubir);
          
          for (let i = 0; i < docIds.length; i++) {
            const docId = docIds[i];
            if (archivosASubir[docId]) {
              // Si hay archivo, marcar automáticamente como entregado
              // Asegurar que documentacionId sea un número
              const documentacionId = typeof docId === 'string' ? parseInt(docId, 10) : docId;
              
              const formData = new FormData();
              formData.append('archivo', archivosASubir[docId]);
              formData.append('documentacionId', documentacionId.toString());
              formData.append('esOriginal', 'false'); // Por defecto es copia

              console.log(`[useUpdateStudent] Subiendo documento ${docId} para estudiante ${nuevoEstudianteId}`);

              try {
                const response = await apiClient.post(`/v1/estudiantes/${nuevoEstudianteId}/documentos`, formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                });
                console.log(`[useUpdateStudent] Documento ${docId} subido correctamente:`, response.data);
              } catch (err) {
                console.error(`[useUpdateStudent] Error al subir documento ${docId}:`, err);
                // Continuar con otros documentos aunque falle uno
              }
              
              // Pequeño delay entre subidas para evitar problemas de concurrencia
              if (i < docIds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100)); // 100ms de delay
              }
            }
          }

          return {
            success: true,
            data: { ...response.data.data, id: nuevoEstudianteId },
            message: response.data.message,
            studentId: nuevoEstudianteId,
          };
        }

        return {
          success: false,
          error: response.data?.message || 'Error al crear el estudiante',
        };
      }

      // Para pasos siguientes o cuando se completa un registro existente, actualizar el estudiante
      // Si es un guardado parcial, indicar al backend que no valide documentos requeridos
      if (isTemporarySave) {
        datosEstudiante.skipDocumentValidation = true;
      }
      
      // Remover estudianteId del body si existe (no debe enviarse al backend)
      delete datosEstudiante.estudianteId;
      delete datosEstudiante.id;
      
      // IMPORTANTE: Si hay studentIdFinal, siempre ACTUALIZAR (PUT) en lugar de crear (POST)
      // Esto asegura que cuando hay estudianteId en la URL, se actualicen los datos existentes
      console.log(`[useUpdateStudent] Actualizando estudiante existente ID: ${studentIdFinal}`);
      
      // El backend extrae los campos documento_{id}_entregado y los procesa usando la tabla documentacion
      const response = await apiClient.put(`/v1/estudiantes/${studentIdFinal}`, datosEstudiante);

      if (response.data?.success) {
        // Subir archivos si los hay de forma SECUENCIAL
        // IMPORTANTE: Si hay un archivo, subirlo aunque el checkbox no esté marcado
        // El hecho de subir un archivo implica que el documento está entregado
        const docIds = Object.keys(archivosASubir);
        
        for (let i = 0; i < docIds.length; i++) {
          const docId = docIds[i];
          if (archivosASubir[docId]) {
            // Si hay archivo, marcar automáticamente como entregado
            // Asegurar que documentacionId sea un número
            const documentacionId = typeof docId === 'string' ? parseInt(docId, 10) : docId;
            
            const formData = new FormData();
            formData.append('archivo', archivosASubir[docId]);
            formData.append('documentacionId', documentacionId.toString());
            formData.append('esOriginal', 'false'); // Por defecto es copia

            console.log(`[useUpdateStudent] Subiendo documento ${docId} para estudiante ${studentIdFinal}`);

            try {
              const uploadResponse = await apiClient.post(`/v1/estudiantes/${studentIdFinal}/documentos`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              });
              console.log(`[useUpdateStudent] Documento ${docId} subido correctamente:`, uploadResponse.data);
            } catch (err) {
              console.error(`[useUpdateStudent] Error al subir documento ${docId}:`, err);
              // Continuar con otros documentos aunque falle uno
            }
            
            // Pequeño delay entre subidas para evitar problemas de concurrencia
            if (i < docIds.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 100)); // 100ms de delay
            }
          }
        }

        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Estudiante actualizado correctamente',
          studentId: studentIdFinal,
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Error al actualizar el estudiante',
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
                          'Error inesperado al actualizar el estudiante';
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
    updateStudent,
    loading,
    error,
  };
};

