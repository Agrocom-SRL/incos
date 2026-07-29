/**
 * Helpers compartidos para la emisión de informes de pasantía con PDF
 * (módulo TUT · pasantías). Patrón dictamenPdfHelpers (titulación): buffer del
 * generador + uploadsStorage.saveToUploads + fila con ruta_archivo.
 * Usados por CreateInformePasantiaUseCase y UpdateInformePasantiaUseCase.
 */

import { UPLOAD } from '../../../../infrastructure/config/uploads.config.js';
import { PasantiaMapper } from '../../../mappers/pasantias/index.js';

/** Fecha actual en formato YYYY-MM-DD. */
export function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Arma el contexto del PDF del informe: fila de la vista 168 (estudiante,
 * empresa, carrera, gestión y docente supervisor resueltos, con nombres en
 * orden institucional APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES).
 *
 * @param {Object} params
 * @param {Object} params.pasantiaViewRepository - Vistas 167/168
 * @param {Object} params.pasantia - Entidad de pasantias (fallback si la vista
 *   aún no expone la fila)
 * @returns {Promise<Object>} Ficha camelCase para el generador
 */
export async function buildContextoInformePdf({ pasantiaViewRepository, pasantia }) {
  const row = await pasantiaViewRepository.findListadoById(pasantia.id);
  if (row) {
    return PasantiaMapper.detalleRowToPresentation(row);
  }
  // Degradación: la vista filtra trámites inactivos; se usa la entidad raíz.
  return { ...pasantia };
}

/**
 * Guarda el PDF del informe en uploads (carpeta del trámite) y registra la
 * fila en pasantias_informes con la ruta del archivo.
 *
 * @param {Object} params
 * @param {Object} params.uploadsStorage - IUploadsStorage
 * @param {Object} params.pasantiaInformeRepository
 * @param {number} params.pasantiaId
 * @param {Buffer} params.buffer - Contenido del PDF
 * @param {string} params.fileName - Nombre del archivo (ej: informe_verificacion_5.pdf)
 * @param {Object} params.informeData - { tipo, docenteId, numeroMemo, fechas, resultado, ... }
 * @param {number|null} params.userId
 * @param {Object} [params.options] - { transaction }
 * @returns {Promise<Object>} Informe creado
 */
export async function guardarInformeConPdf({
  uploadsStorage,
  pasantiaInformeRepository,
  pasantiaId,
  buffer,
  fileName,
  informeData,
  userId = null,
  options = {},
}) {
  const saved = uploadsStorage.saveToUploads(UPLOAD.pasantias(pasantiaId), fileName, buffer);

  return pasantiaInformeRepository.create(
    {
      pasantiaId,
      ...informeData,
      nombreArchivo: saved.fileName,
      rutaArchivo: saved.absolutePath,
      extension: 'pdf',
      tipoMime: 'application/pdf',
    },
    userId,
    options
  );
}

/**
 * Regenera el PDF de un informe existente (misma ruta: saveToUploads
 * sobrescribe) y actualiza la fila con los datos editados.
 *
 * @param {Object} params
 * @param {Object} params.uploadsStorage - IUploadsStorage
 * @param {Object} params.pasantiaInformeRepository
 * @param {number} params.pasantiaId
 * @param {number} params.informeId
 * @param {Buffer} params.buffer - Contenido del PDF regenerado
 * @param {string} params.fileName - Nombre del archivo (se conserva el original)
 * @param {Object} params.informeData - Campos editados del informe
 * @param {number|null} params.userId
 * @returns {Promise<Object>} Informe actualizado
 */
export async function actualizarInformeConPdf({
  uploadsStorage,
  pasantiaInformeRepository,
  pasantiaId,
  informeId,
  buffer,
  fileName,
  informeData,
  userId = null,
}) {
  const saved = uploadsStorage.saveToUploads(UPLOAD.pasantias(pasantiaId), fileName, buffer);

  return pasantiaInformeRepository.update(
    informeId,
    {
      ...informeData,
      nombreArchivo: saved.fileName,
      rutaArchivo: saved.absolutePath,
      extension: 'pdf',
      tipoMime: 'application/pdf',
    },
    userId
  );
}
