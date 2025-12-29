/**
 * Mapper: CarreraMapper
 * Convierte entre formato del backend (API) y formato de dominio (entidad Career)
 * 
 * Clean Architecture:
 * - Domain Layer: Transformación de datos entre capas
 * - Extiende BaseMapper para reutilizar métodos comunes
 * 
 * El backend retorna:
 * {
 *   id: number,
 *   codigo: string,
 *   nombre: string,
 *   imagen_nombre: string,
 *   imagen_ruta: string,
 *   imagen_url: string
 * }
 * 
 * La entidad Career espera más campos, este mapper normaliza los datos.
 */

import { BaseMapper } from './BaseMapper.js';

/**
 * Construye la URL completa de una imagen basándose en la ruta del servidor
 * @param {string} imagenRuta - Ruta relativa de la imagen (ej: /uploads/carreras/imagenes/1/1_SIS-INF.webp)
 * @param {string} imagenUrl - URL completa de la imagen (si existe, se usa directamente)
 * @returns {string|null} URL completa de la imagen o null si no hay ruta ni URL
 */
function buildImageUrl(imagenRuta, imagenUrl) {
  // Si hay URL completa, usarla directamente
  if (imagenUrl) {
    return imagenUrl;
  }
  
  // Si hay ruta relativa, construir URL completa
  if (imagenRuta) {
    // Obtener la base URL del backend (sin /api)
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    // Remover /api del final si existe
    const backendBaseUrl = apiBaseUrl.replace(/\/api$/, '');
    // Construir URL completa
    return `${backendBaseUrl}${imagenRuta.startsWith('/') ? imagenRuta : '/' + imagenRuta}`;
  }
  
  return null;
}

export class CarreraMapper extends BaseMapper {
  /**
   * Convierte datos del backend (API response) a formato de dominio (para crear entidad Career)
   * @param {Object} dataBackend - Datos que vienen del backend
   * @returns {Object} - Datos normalizados para crear entidad Career
   */
  static toDomain(dataBackend) {
    if (!dataBackend) return null;

    return {
      id: dataBackend.id || null,
      codigo: dataBackend.codigo || null,
      nombre: dataBackend.nombre || null,
      // Campos que pueden venir del backend pero no siempre
      descripcion: dataBackend.descripcion || null,
      activa: dataBackend.activa !== undefined ? dataBackend.activa : true,
      duracionAnios: dataBackend.duracionAnios || dataBackend.duracion_anios || null,
      tituloOtorgado: dataBackend.tituloOtorgado || dataBackend.titulo_otorgado || null,
      resolucionMinisterial: dataBackend.resolucionMinisterial || dataBackend.resolucion_ministerial || null,
      fechaVigencia: dataBackend.fechaVigencia || dataBackend.fecha_vigencia || null,
      cargaHorariaTotal: dataBackend.cargaHorariaTotal || dataBackend.carga_horaria_total || null,
      colorHex: dataBackend.colorHex || dataBackend.color_hex || null,
      gestionId: dataBackend.gestionId || null,
      turnoId: dataBackend.turnoId || null,
      // Campos de imagen
      imagenNombre: dataBackend.imagenNombre || dataBackend.imagen_nombre || null,
      imagenRuta: dataBackend.imagenRuta || dataBackend.imagen_ruta || null,
      imagenUrl: dataBackend.imagenUrl || dataBackend.imagen_url || null,
      // Campos para UI (se agregan en el mapper, no vienen del backend)
      label: dataBackend.nombre || null,
      // Construir URL completa de la imagen para compatibilidad
      image: buildImageUrl(
        dataBackend.imagenRuta || dataBackend.imagen_ruta,
        dataBackend.imagenUrl || dataBackend.imagen_url
      ) || dataBackend.image || dataBackend.imagen || null,
    };
  }

  // arrayToDomain se hereda de BaseMapper

  /**
   * Convierte datos del backend a formato simple para UI (sin entidad completa)
   * Útil para listas simples donde solo se necesita mostrar datos básicos
   * @param {Object} dataBackend - Datos que vienen del backend
   * @returns {Object} - Datos simples para UI
   */
  static toSimpleUI(dataBackend) {
    if (!dataBackend) return null;

    const imagenRuta = dataBackend.imagenRuta || dataBackend.imagen_ruta || null;
    const imagenUrl = dataBackend.imagenUrl || dataBackend.imagen_url || null;
    
    // Construir URL completa de la imagen
    const imageUrl = buildImageUrl(imagenRuta, imagenUrl);

    return {
      id: dataBackend.id || null,
      codigo: dataBackend.codigo || null,
      nombre: dataBackend.nombre || null,
      label: dataBackend.nombre || null, // Para UI
      // Campo image con URL completa construida (prioridad: imagenUrl > imagenRuta construida > image genérico)
      image: imageUrl || dataBackend.image || dataBackend.imagen || null,
      imagenNombre: dataBackend.imagenNombre || dataBackend.imagen_nombre || null,
      imagenRuta: imagenRuta,
      imagenUrl: imageUrl, // URL completa (ya construida)
      activa: dataBackend.activa !== undefined ? dataBackend.activa : true,
    };
  }

  // arrayToSimpleUI se hereda de BaseMapper

  /**
   * Convierte una entidad Career a formato para enviar al backend (POST/PUT)
   * @param {Career} career - Entidad Career
   * @returns {Object} - Datos en formato del backend
   */
  static toBackend(career) {
    if (!career) return null;

    return {
      id: career.id,
      codigo: career.codigo,
      nombre: career.nombre,
      descripcion: career.descripcion,
      activa: career.activa,
      duracionAnios: career.duracionAnios,
      tituloOtorgado: career.tituloOtorgado,
      resolucionMinisterial: career.resolucionMinisterial,
      fechaVigencia: career.fechaVigencia,
      cargaHorariaTotal: career.cargaHorariaTotal,
      colorHex: career.colorHex,
      imagenNombre: career.imagenNombre,
      imagenRuta: career.imagenRuta,
      imagenUrl: career.imagenUrl,
      gestionId: career.gestionId,
      turnoId: career.turnoId,
    };
  }
}

