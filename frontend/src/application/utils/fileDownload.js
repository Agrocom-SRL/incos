/**
 * Utilidad para descargar archivos desde el backend
 * 
 * Single Responsibility: Manejar la descarga de archivos estáticos
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Utilidad técnica para descarga de archivos
 */

/**
 * Descarga un archivo desde la ruta proporcionada
 * @param {string} filePath - Ruta relativa del archivo (ej: /uploads/documentos/estudiantes/3/FORMULARIO_INSCRIPCION_3_xxx.pdf)
 * @param {string} fileName - Nombre del archivo para la descarga
 */
export const downloadFile = (filePath, fileName) => {
  try {
    // Los archivos estáticos se sirven directamente en /uploads (sin /api)
    // Usar window.location.origin para obtener la base URL del servidor
    const baseUrl = window.location.origin;
    const fileUrl = `${baseUrl}${filePath}`;

    // Crear un elemento <a> temporal para descargar el archivo
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'documento.pdf';
    link.target = '_blank';
    
    // Agregar al DOM, hacer click, y remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Error al descargar el archivo:', err);
    throw new Error('No se pudo descargar el archivo');
  }
};
