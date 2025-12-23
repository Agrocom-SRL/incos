// modules/estudiantes/helpers/formatStudentData.js
/**
 * Helper para formatear datos del estudiante para el formulario
 * 
 * Responsabilidad: Convertir datos del backend al formato esperado por el formulario
 */

import dayjs from 'dayjs';

/**
 * Procesa documentos del estudiante y genera estructura de documentos existentes
 * @param {Array} documentos - Lista de documentos digitales del backend (documentos_estudiante)
 * @param {string|number} estudianteId - ID del estudiante
 * @param {Array} entregasDocumentos - Lista de entregas físicas del backend (estudiantes_documentos_entrega)
 * @returns {Object} Objeto con { documentosExistentes, datosFormateados }
 */
export const processStudentDocuments = (documentos = [], estudianteId, entregasDocumentos = [], documentacionInscripcion = []) => {
  const documentosExistentes = {};
  const datosFormateados = {};

  // Primero, marcar TODOS los documentos como entregados por defecto (initialValue: true)
  // Esto asegura que todos aparezcan marcados inicialmente
  if (Array.isArray(documentacionInscripcion)) {
    documentacionInscripcion.forEach((doc) => {
      // Solo documentos de tipo INSCRIPCION que son padres (sin documentoPadreId)
      const documentoPadreId = doc.documentoPadreId || doc.documento_padre_id;
      if (doc.tipoDocumento === 'INSCRIPCION' && (documentoPadreId === null || documentoPadreId === undefined)) {
        datosFormateados[`documento_${doc.id}_entregado`] = true;
      }
    });
  }

  // Luego procesar entregas físicas para actualizar estados
  entregasDocumentos.forEach((entrega) => {
    // El campo puede ser documentacionId o documentacion_id dependiendo del formato del backend
    const docId = entrega.documentacionId || entrega.documentacion_id;
    
    if (docId) {
      // Actualizar el estado según la entrega física
      // Si entregado es false, desmarcar; si es true, marcar
      datosFormateados[`documento_${docId}_entregado`] = entrega.entregado === true || entrega.entregado === 1;
    }
  });

  // Luego procesar documentos digitales (archivos subidos)
  documentos.forEach((doc) => {
    // El campo puede ser documentacionId o documentacion_id dependiendo del formato del backend
    const docId = doc.documentacionId || doc.documentacion_id;
    
    if (docId) {
      // Si hay un archivo digital, marcar como entregado (el archivo implica entrega)
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
 * @param {Array} documentos - Lista de documentos digitales del estudiante (documentos_estudiante)
 * @param {Object} datosAcademicos - Datos académicos del estudiante
 * @param {string|number} estudianteId - ID del estudiante
 * @param {Array} entregasDocumentos - Lista de entregas físicas del estudiante (estudiantes_documentos_entrega)
 * @param {Array} documentacionInscripcion - Lista de documentación requerida para establecer valores por defecto
 * @returns {Object} Datos formateados para el formulario
 */
export const formatStudentDataForForm = (
  estudiante = {},
  documentos = [],
  datosAcademicos = null,
  estudianteId = null,
  entregasDocumentos = [],
  documentacionInscripcion = []
) => {
  // Procesar documentos (digitales y entregas físicas)
  const { documentosExistentes, datosFormateados: docData } = processStudentDocuments(
    documentos,
    estudianteId || estudiante.id,
    entregasDocumentos,
    documentacionInscripcion
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
