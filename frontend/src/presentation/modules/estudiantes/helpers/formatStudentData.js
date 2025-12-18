// modules/estudiantes/helpers/formatStudentData.js
/**
 * Helper para formatear datos del estudiante para el formulario
 * 
 * Responsabilidad: Convertir datos del backend al formato esperado por el formulario
 */

import dayjs from 'dayjs';

/**
 * Procesa documentos del estudiante y genera estructura de documentos existentes
 * @param {Array} documentos - Lista de documentos del backend
 * @param {string|number} estudianteId - ID del estudiante
 * @returns {Object} Objeto con { documentosExistentes, datosFormateados }
 */
export const processStudentDocuments = (documentos = [], estudianteId) => {
  const documentosExistentes = {};
  const datosFormateados = {};

  documentos.forEach((doc) => {
    // El campo puede ser documentacionId o documentacion_id dependiendo del formato del backend
    const docId = doc.documentacionId || doc.documentacion_id;
    
    if (docId) {
      // IMPORTANTE: Marcar checkbox como entregado (siempre que haya un documento registrado)
      datosFormateados[`documento_${docId}_entregado`] = true;
      
      // Si hay archivo, guardar información del documento existente
      const fileName = doc.nombreArchivo || doc.fileName || doc.nombre_archivo;
      const filePath = doc.rutaArchivo || doc.filePath || doc.ruta_archivo;
      
      // Verificar si hay un archivo válido
      if (fileName && fileName.trim() !== '' && fileName !== 'tmp' && fileName !== 'pendiente_') {
        // Construir URL completa si es necesario
        let url = filePath;
        if (filePath && !filePath.startsWith('http') && !filePath.startsWith('/')) {
          url = `/api/v1/estudiantes/${estudianteId}/documentos/${doc.id}/archivo`;
        } else if (!filePath && fileName) {
          url = `/api/v1/estudiantes/${estudianteId}/documentos/${doc.id}/archivo`;
        } else if (filePath && filePath.startsWith('/uploads')) {
          // Usar URL relativa para que funcione con el proxy de Nginx
          // Nginx servirá /uploads/ directamente desde el backend
          url = filePath; // Ya es una ruta relativa (/uploads/...)
        }
        
        documentosExistentes[docId] = {
          id: doc.id,
          nombreArchivo: fileName,
          rutaArchivo: filePath,
          url: url || filePath,
        };
      }
    }
  });

  return { documentosExistentes, datosFormateados };
};

/**
 * Formatea datos del estudiante para el formulario
 * @param {Object} estudiante - Datos del estudiante del backend
 * @param {Array} documentos - Lista de documentos del estudiante
 * @param {Object} datosAcademicos - Datos académicos del estudiante
 * @param {string|number} estudianteId - ID del estudiante
 * @returns {Object} Datos formateados para el formulario
 */
export const formatStudentDataForForm = (
  estudiante = {},
  documentos = [],
  datosAcademicos = null,
  estudianteId = null
) => {
  // Procesar documentos
  const { documentosExistentes, datosFormateados: docData } = processStudentDocuments(
    documentos,
    estudianteId || estudiante.id
  );

  // Formatear datos básicos del estudiante
  const datosFormateados = {
    ...estudiante,
    estudianteId: estudiante.id || estudianteId,
    fechaNacimiento: estudiante.fechaNacimiento 
      ? dayjs(estudiante.fechaNacimiento) 
      : undefined,
    // Normalizar valores booleanos (pueden venir como 1/0 desde el backend)
    tieneDiscapacidad: estudiante.tieneDiscapacidad !== undefined 
      ? Boolean(estudiante.tieneDiscapacidad) 
      : false,
    // Agregar datos de documentos
    ...docData,
  };

  // Agregar documentos existentes
  if (Object.keys(documentosExistentes).length > 0) {
    datosFormateados._documentosExistentes = documentosExistentes;
  }

  // Agregar datos académicos si existen
  if (datosAcademicos) {
    // Campos académicos principales
    datosFormateados.carreraId = datosAcademicos.carreraId;
    datosFormateados.gestionIngresoId = datosAcademicos.gestionId || datosAcademicos.gestionIngresoId;
    
    // Campos académicos adicionales
    if (datosAcademicos.unidadEducativaProcedencia !== undefined) {
      datosFormateados.unidadEducativaProcedencia = datosAcademicos.unidadEducativaProcedencia;
    }
    if (datosAcademicos.anioEgresoSecundaria !== undefined) {
      datosFormateados.anioEgresoSecundaria = datosAcademicos.anioEgresoSecundaria;
    }
    if (datosAcademicos.promedioAnual !== undefined) {
      datosFormateados.promedioAnual = datosAcademicos.promedioAnual;
    }
    if (datosAcademicos.fechaEgreso !== undefined) {
      datosFormateados.fechaEgreso = datosAcademicos.fechaEgreso 
        ? dayjs(datosAcademicos.fechaEgreso) 
        : undefined;
    }
    if (datosAcademicos.fechaRetiro !== undefined) {
      datosFormateados.fechaRetiro = datosAcademicos.fechaRetiro 
        ? dayjs(datosAcademicos.fechaRetiro) 
        : undefined;
    }
    if (datosAcademicos.motivoRetiro !== undefined) {
      datosFormateados.motivoRetiro = datosAcademicos.motivoRetiro;
    }
    if (datosAcademicos.estadoAcademico !== undefined) {
      datosFormateados.estadoAcademico = datosAcademicos.estadoAcademico;
    }
  }

  return datosFormateados;
};
