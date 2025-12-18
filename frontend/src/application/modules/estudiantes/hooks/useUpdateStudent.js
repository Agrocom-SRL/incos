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
      console.log(`[useUpdateStudent] ===== INICIO updateStudent =====`);
      console.log(`[useUpdateStudent] Parámetros recibidos:`, {
        studentId: studentId,
        step: step,
        isFinalStep: isFinalStep,
        isTemporarySave: isTemporarySave,
        studentDataKeys: Object.keys(studentData),
        studentDataEstudianteId: studentData.estudianteId,
        studentDataId: studentData.id,
      });
      
      // Separar documentos del resto de los datos
      // El backend ahora maneja los documentos dinámicamente usando documentacion_id
      const datosEstudiante = { ...studentData };
      const documentosEntregados = {}; // Para subida de archivos (usa docId)
      const archivosASubir = {}; // Para subida de archivos (usa docId)

      // Eliminar campos que no se guardan en BD (requisitos físicos)
      delete datosEstudiante.folderConNepaco; // No se guarda, es solo un requisito físico

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

      // Verificar si hay un estudianteId en los datos (viene de la URL cuando se completa registro)
      const estudianteIdEnDatos = studentData.estudianteId || studentData.id;
      // Priorizar: studentId (parámetro) > estudianteIdEnDatos (de los datos)
      const studentIdFinal = studentId || estudianteIdEnDatos;
      
      console.log(`[useUpdateStudent] Determinando studentIdFinal:`, {
        studentIdParam: studentId,
        estudianteIdEnDatos: estudianteIdEnDatos,
        studentIdFinal: studentIdFinal,
        isTemporarySave: isTemporarySave,
        decision: studentIdFinal ? 'ACTUALIZAR (PUT)' : 'CREAR (POST)',
        willUpdate: studentIdFinal ? 'SÍ - Actualizar en backend' : 'SÍ - Crear en backend (siempre crear, incluso en guardado temporal)',
      });

      // ============================================
      // LÓGICA PARA AMBOS CASOS:
      // 1. Si HAY estudiante existente (studentIdFinal) → ACTUALIZAR (PUT) - líneas 170-281
      // 2. Si NO hay estudiante existente → CREAR (POST) - líneas 106-168
      // ============================================
      
      // CASO 1: Si HAY un estudiante existente, SIEMPRE actualizar en el backend
      // Esto funciona tanto para:
      // - Editar estudiante existente desde URL (?estudianteId=1)
      // - Completar registro de estudiante incompleto
      // - Guardado temporal de estudiante existente
      if (studentIdFinal) {
        // Continuar con la lógica de actualización más abajo (línea 170)
      } 
      // CASO 2: Si NO hay estudiante existente, SIEMPRE crear en el backend
      // Esto funciona para:
      // - Registrar nuevo estudiante
      // - Guardado temporal de nuevo estudiante (también se crea)
      // El guardado temporal solo afecta la validación de documentos, no si se crea o no
      else {
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

      // ============================================
      // CASO 1: ACTUALIZAR ESTUDIANTE EXISTENTE (PUT)
      // ============================================
      // Este bloque se ejecuta cuando studentIdFinal existe
      // Funciona para:
      // - Editar estudiante existente desde URL (?estudianteId=1)
      // - Completar registro de estudiante incompleto
      // - Guardado temporal de estudiante existente
      
      // Si es un guardado parcial, indicar al backend que no valide documentos requeridos
      if (isTemporarySave) {
        datosEstudiante.skipDocumentValidation = true;
      }
      
      // Remover estudianteId del body si existe (no debe enviarse al backend)
      delete datosEstudiante.estudianteId;
      delete datosEstudiante.id;
      
      // Procesar fechaNacimiento: si viene como objeto dayjs, convertirlo a string ISO
      if (datosEstudiante.fechaNacimiento && typeof datosEstudiante.fechaNacimiento === 'object' && datosEstudiante.fechaNacimiento.format) {
        // Es un objeto dayjs
        datosEstudiante.fechaNacimiento = datosEstudiante.fechaNacimiento.format('YYYY-MM-DD');
      } else if (datosEstudiante.fechaNacimiento && typeof datosEstudiante.fechaNacimiento === 'object' && datosEstudiante.fechaNacimiento.toISOString) {
        // Es un objeto Date
        datosEstudiante.fechaNacimiento = datosEstudiante.fechaNacimiento.toISOString().split('T')[0];
      }
      
      // Limpiar campos vacíos: convertir strings vacíos a null para que el backend los procese correctamente
      // Esto es importante porque algunos campos pueden venir como "" en lugar de null
      Object.keys(datosEstudiante).forEach(key => {
        // Si el campo es un string vacío, convertirlo a null
        if (typeof datosEstudiante[key] === 'string' && datosEstudiante[key].trim() === '') {
          datosEstudiante[key] = null;
        }
        // Si el campo es undefined, eliminarlo (no enviarlo)
        if (datosEstudiante[key] === undefined) {
          delete datosEstudiante[key];
        }
      });
      
      // IMPORTANTE: Si hay studentIdFinal, siempre ACTUALIZAR (PUT) en lugar de crear (POST)
      // Esto asegura que cuando hay estudianteId en la URL, se actualicen los datos existentes
      console.log(`[useUpdateStudent] Actualizando estudiante existente ID: ${studentIdFinal}`);
      console.log(`[useUpdateStudent] Datos a enviar (después de limpiar):`, {
        campos: Object.keys(datosEstudiante),
        totalCampos: Object.keys(datosEstudiante).length,
        muestra: {
          nombres: datosEstudiante.nombres,
          apellidoPaterno: datosEstudiante.apellidoPaterno,
          apellidoMaterno: datosEstudiante.apellidoMaterno,
          ci: datosEstudiante.ci,
          expedicion: datosEstudiante.expedicion,
          celular: datosEstudiante.celular,
          emailPersonal: datosEstudiante.emailPersonal,
          fechaNacimiento: datosEstudiante.fechaNacimiento,
        },
      });
      
      // El backend extrae los campos documento_{id}_entregado y los procesa usando la tabla documentacion
      console.log(`[useUpdateStudent] Enviando PUT a /v1/estudiantes/${studentIdFinal}`);
      
      try {
        const response = await apiClient.put(`/v1/estudiantes/${studentIdFinal}`, datosEstudiante);
        
        console.log(`[useUpdateStudent] Respuesta del backend:`, {
          success: response.data?.success,
          message: response.data?.message,
          dataKeys: response.data?.data ? Object.keys(response.data.data) : null,
          status: response.status,
        });

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
      } catch (putError) {
        // Capturar errores específicos del PUT para ver qué está fallando
        console.error(`[useUpdateStudent] Error en PUT /v1/estudiantes/${studentIdFinal}:`, {
          status: putError.response?.status,
          statusText: putError.response?.statusText,
          error: putError.response?.data,
          errorMessage: putError.message,
          dataEnviada: {
            campos: Object.keys(datosEstudiante),
            muestra: {
              nombres: datosEstudiante.nombres,
              apellidoPaterno: datosEstudiante.apellidoPaterno,
              ci: datosEstudiante.ci,
              fechaNacimiento: datosEstudiante.fechaNacimiento,
            },
          },
        });
        
        // Re-lanzar el error para que se maneje en el catch general
        throw putError;
      }
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

