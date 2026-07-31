/**
 * Helpers compartidos para la emisión de dictámenes con PDF (módulo TIT · titulación).
 * Usados por AsignarTutorProyectoUseCase (DESIGNACION_OFICIAL) y
 * AprobarEtapaProyectoUseCase (VIABILIDAD_TECNICA).
 */

import { UPLOAD } from '../../../../infrastructure/config/uploads.config.js';
import { ProyectoGradoMapper } from '../../../mappers/titulacion/index.js';

/** Fecha actual en formato YYYY-MM-DD. */
export function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Arma el contexto común del PDF de dictamen: fila de la vista 160 (datos del
 * proyecto/modalidad/carrera/tutor), integrantes (vista 159) y año de gestión.
 *
 * @param {Object} params
 * @param {Object} params.proyectoGradoListadoViewRepository
 * @param {Object} params.managementRepository
 * @param {Object} params.proyecto - Entidad de proyectos_grado
 * @returns {Promise<{proyectoPdf: Object, integrantes: Array, tutorNombre: string|null}>}
 */
export async function buildContextoDictamenPdf({
  proyectoGradoListadoViewRepository,
  managementRepository,
  proyecto,
}) {
  const [row, integranteRows] = await Promise.all([
    proyectoGradoListadoViewRepository.findListadoById(proyecto.id),
    proyectoGradoListadoViewRepository.findIntegrantesByProyectoId(proyecto.id),
  ]);

  let gestionAnio = null;
  if (proyecto.gestionId && managementRepository) {
    const gestion = await managementRepository.findById(proyecto.gestionId);
    const plain = gestion?.toPlainObject?.() ?? gestion;
    gestionAnio = plain?.year ?? plain?.anio ?? null;
  }

  return {
    proyectoPdf: {
      titulo: proyecto.titulo,
      modalidadNombre: row?.modalidad_nombre ?? null,
      carreraNombre: row?.carrera_nombre ?? null,
      gestionAnio,
    },
    integrantes: ProyectoGradoMapper.integranteRowsToPresentation(integranteRows),
    tutorNombre: row?.tutor_nombre ?? null,
  };
}

/**
 * Guarda el PDF del dictamen en uploads (carpeta del proyecto) y registra la
 * fila en dictamenes_proyecto con la ruta del archivo.
 *
 * @param {Object} params
 * @param {Object} params.uploadsStorage - IUploadsStorage
 * @param {Object} params.dictamenProyectoRepository
 * @param {number} params.proyectoGradoId
 * @param {Buffer} params.buffer - Contenido del PDF
 * @param {string} params.fileName - Nombre del archivo (ej: designacion_tutor_5.pdf)
 * @param {Object} params.dictamenData - { tipo, numeroInforme, resultado, fechaEmision, destinatario, contenido }
 * @param {number|null} params.userId
 * @param {Object} [params.options] - { transaction }
 * @returns {Promise<Object>} Dictamen creado
 */
export async function guardarDictamenConPdf({
  uploadsStorage,
  dictamenProyectoRepository,
  proyectoGradoId,
  buffer,
  fileName,
  dictamenData,
  userId = null,
  options = {},
}) {
  const saved = uploadsStorage.saveToUploads(
    UPLOAD.proyectosGrado(proyectoGradoId),
    fileName,
    buffer
  );

  return dictamenProyectoRepository.create(
    {
      proyectoGradoId,
      ...dictamenData,
      nombreArchivo: saved.fileName,
      rutaArchivo: saved.absolutePath,
      extension: 'pdf',
      tipoMime: 'application/pdf',
    },
    userId,
    options
  );
}
