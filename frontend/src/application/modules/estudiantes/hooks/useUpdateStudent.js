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

  const updateStudent = async (studentId, studentData, step = null, isFinalStep = false, isTemporarySave = false, documentacionInscripcion = []) => {
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
      // El backend ahora separa entregas físicas (estudiantes_documentos_entrega) de archivos digitales (documentos_estudiante)
      // Los checkboxes documento_{id}_entregado se procesan en el backend para crear/actualizar entregas
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

      // Transformar discapacidades al formato esperado por el backend
      // El backend espera: discapacidades = [{ tipoDiscapacidadId: 1, descripcion: "...", gradoDiscapacidad: "LEVE", causa: "..." }]
      if (datosEstudiante.tieneDiscapacidad && datosEstudiante.tipoDiscapacidadId) {
        datosEstudiante.discapacidades = [{
          tipoDiscapacidadId: datosEstudiante.tipoDiscapacidadId,
          descripcion: datosEstudiante.detallesDiscapacidad || null,
          gradoDiscapacidad: datosEstudiante.gradoInvalidez || null,
          causa: datosEstudiante.causa || null,
        }];
      } else {
        datosEstudiante.discapacidades = [];
      }

      // Transformar orígenes al formato esperado por el backend
      // El backend espera: origenes = [{ tipoOrigen: 'NACIONALIDAD_PRINCIPAL'|'NACIONALIDAD_SECUNDARIA', paisId?, municipioNacimientoId?, ciudadNacimiento?, idiomaMaternoId?, idiomaSecundarioId?, esPrincipal: boolean }]
      datosEstudiante.origenes = [];
      
      if (datosEstudiante.tipoNacionalidad === 'BOLIVIANA') {
        // Nacionalidad boliviana simple
        const origen = {
          tipoOrigen: 'NACIONALIDAD_PRINCIPAL',
          esPrincipal: true,
          municipioNacimientoId: datosEstudiante.municipioNacimientoId || null,
          ciudadNacimiento: datosEstudiante.ciudadNacimiento || null,
          paisId: null,
          idiomaMaternoId: datosEstudiante.idiomaPrincipalId || null,
          idiomaSecundarioId: datosEstudiante.idiomaSecundarioId || null,
        };
        if (origen.municipioNacimientoId) {
          datosEstudiante.origenes.push(origen);
        }
      } else if (datosEstudiante.tipoNacionalidad === 'EXTRANJERA') {
        // Nacionalidad extranjera simple
        const origen = {
          tipoOrigen: 'NACIONALIDAD_PRINCIPAL',
          esPrincipal: true,
          paisId: datosEstudiante.paisNacimientoId || null,
          ciudadNacimiento: datosEstudiante.ciudadNacimientoExtranjero || null,
          municipioNacimientoId: null,
          idiomaMaternoId: datosEstudiante.idiomaPrincipalId || null,
          idiomaSecundarioId: datosEstudiante.idiomaSecundarioId || null,
        };
        if (origen.paisId) {
          datosEstudiante.origenes.push(origen);
        }
      } else if (datosEstudiante.tipoNacionalidad === 'DOBLE_NACIONALIDAD') {
        // Doble nacionalidad: crear dos orígenes
        
        // Primera nacionalidad
        const primeraOrigen = {
          tipoOrigen: 'NACIONALIDAD_PRINCIPAL',
          esPrincipal: true,
          idiomaMaternoId: datosEstudiante.idiomaPrincipalId || null,
          idiomaSecundarioId: datosEstudiante.idiomaSecundarioId || null,
        };
        
        if (datosEstudiante.primeraNacionalidadTipo === 'BOLIVIANA') {
          primeraOrigen.municipioNacimientoId = datosEstudiante.primeraNacionalidadMunicipioId || null;
          primeraOrigen.ciudadNacimiento = datosEstudiante.primeraNacionalidadLocalidad || null;
          primeraOrigen.paisId = null;
        } else if (datosEstudiante.primeraNacionalidadTipo === 'EXTRANJERA') {
          primeraOrigen.paisId = datosEstudiante.primeraNacionalidadPaisId || null;
          primeraOrigen.ciudadNacimiento = datosEstudiante.primeraNacionalidadCiudad || null;
          primeraOrigen.municipioNacimientoId = null;
        }
        
        if (primeraOrigen.paisId || primeraOrigen.municipioNacimientoId) {
          datosEstudiante.origenes.push(primeraOrigen);
        }
        
        // Segunda nacionalidad
        const segundaOrigen = {
          tipoOrigen: 'NACIONALIDAD_SECUNDARIA',
          esPrincipal: false,
          // Los idiomas se asocian con la primera nacionalidad (principal)
          idiomaMaternoId: null,
          idiomaSecundarioId: null,
        };
        
        if (datosEstudiante.segundaNacionalidadTipo === 'BOLIVIANA') {
          segundaOrigen.municipioNacimientoId = datosEstudiante.segundaNacionalidadMunicipioId || null;
          segundaOrigen.ciudadNacimiento = datosEstudiante.segundaNacionalidadLocalidad || null;
          segundaOrigen.paisId = null;
        } else if (datosEstudiante.segundaNacionalidadTipo === 'EXTRANJERA') {
          segundaOrigen.paisId = datosEstudiante.segundaNacionalidadPaisId || null;
          segundaOrigen.ciudadNacimiento = datosEstudiante.segundaNacionalidadCiudad || null;
          segundaOrigen.municipioNacimientoId = null;
        }
        
        if (segundaOrigen.paisId || segundaOrigen.municipioNacimientoId) {
          datosEstudiante.origenes.push(segundaOrigen);
        }
      }

      // Eliminar campos individuales de origen del objeto principal
      delete datosEstudiante.tipoNacionalidad;
      delete datosEstudiante.paisNacimientoId;
      delete datosEstudiante.ciudadNacimientoExtranjero;
      delete datosEstudiante.departamentoNacimientoId;
      delete datosEstudiante.provinciaNacimientoId;
      delete datosEstudiante.municipioNacimientoId;
      delete datosEstudiante.ciudadNacimiento;
      delete datosEstudiante.idiomaNatalId;
      delete datosEstudiante.idiomaPrincipalId;
      delete datosEstudiante.idiomaSecundarioId;
      // Campos de doble nacionalidad
      delete datosEstudiante.primeraNacionalidadTipo;
      delete datosEstudiante.primeraNacionalidadPaisId;
      delete datosEstudiante.primeraNacionalidadCiudad;
      delete datosEstudiante.primeraNacionalidadDepartamentoId;
      delete datosEstudiante.primeraNacionalidadProvinciaId;
      delete datosEstudiante.primeraNacionalidadMunicipioId;
      delete datosEstudiante.primeraNacionalidadLocalidad;
      delete datosEstudiante.segundaNacionalidadTipo;
      delete datosEstudiante.segundaNacionalidadPaisId;
      delete datosEstudiante.segundaNacionalidadCiudad;
      delete datosEstudiante.segundaNacionalidadDepartamentoId;
      delete datosEstudiante.segundaNacionalidadProvinciaId;
      delete datosEstudiante.segundaNacionalidadMunicipioId;
      delete datosEstudiante.segundaNacionalidadLocalidad;

      // Extraer archivos y documentos entregados
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
            console.warn(`[useUpdateStudent] No se pudo extraer ID numérico del campo: ${key}`);
            return;
          }
          
          if (studentData[key]) {
            documentosEntregados[docId] = true;
            // Guardar info de documentación si no está ya guardada
            if (!documentosInfo[docId] && documentacionMap[docId]) {
              documentosInfo[docId] = documentacionMap[docId];
            }
          }
          // Mantener en el body, el backend lo procesará para crear/actualizar entregas en estudiantes_documentos_entrega
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

          // Subir archivos digitales después de crear el estudiante de forma SECUENCIAL
          // IMPORTANTE: Los documentos ya fueron marcados como entregados en el backend (estudiantes_documentos_entrega)
          // Ahora subimos los archivos digitales (documentos_estudiante)
          const docIds = Object.keys(archivosASubir);
          
          for (let i = 0; i < docIds.length; i++) {
            const docId = docIds[i];
            if (archivosASubir[docId]) {
              const documentacionId = typeof docId === 'string' ? parseInt(docId, 10) : docId;
              const docInfo = documentosInfo[docId];
              
              if (!docInfo) {
                console.warn(`[useUpdateStudent] No se encontró información de documentación para ID ${docId}, saltando subida`);
                continue;
              }
              
              // Obtener tipoDocumento de la documentación
              const tipoDocumento = docInfo.tipoDocumento || 'INSCRIPCION';
              
              const formData = new FormData();
              formData.append('archivo', archivosASubir[docId]);
              formData.append('tipoDocumento', tipoDocumento);
              formData.append('documentacionId', documentacionId.toString());
              formData.append('contieneMultipleDocumentos', 'false'); // Por defecto un archivo = un documento

              console.log(`[useUpdateStudent] Subiendo documento ${docId} (${tipoDocumento}) para estudiante ${nuevoEstudianteId}`);

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
          // Subir archivos digitales si los hay de forma SECUENCIAL
          // IMPORTANTE: Los documentos ya fueron marcados como entregados en el backend (estudiantes_documentos_entrega)
          // Ahora subimos los archivos digitales (documentos_estudiante)
          const docIds = Object.keys(archivosASubir);
          
          for (let i = 0; i < docIds.length; i++) {
            const docId = docIds[i];
            if (archivosASubir[docId]) {
              const documentacionId = typeof docId === 'string' ? parseInt(docId, 10) : docId;
              const docInfo = documentosInfo[docId];
              
              if (!docInfo) {
                console.warn(`[useUpdateStudent] No se encontró información de documentación para ID ${docId}, saltando subida`);
                continue;
              }
              
              // Obtener tipoDocumento de la documentación
              const tipoDocumento = docInfo.tipoDocumento || 'INSCRIPCION';
              
              const formData = new FormData();
              formData.append('archivo', archivosASubir[docId]);
              formData.append('tipoDocumento', tipoDocumento);
              formData.append('documentacionId', documentacionId.toString());
              formData.append('contieneMultipleDocumentos', 'false'); // Por defecto un archivo = un documento

              console.log(`[useUpdateStudent] Subiendo documento ${docId} (${tipoDocumento}) para estudiante ${studentIdFinal}`);

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

