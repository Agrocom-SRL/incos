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
export const downloadFile = async (filePath, fileName) => {
  try {
    // Los archivos estáticos se sirven directamente en /uploads (sin /api)
    // Vite tiene un proxy configurado para /uploads que redirige al backend
    const baseUrl = window.location.origin;
    
    // Normalizar el filePath:
    // - Remover cualquier prefijo relativo (./, ../)
    // - Asegurar que empiece con /
    // - Remover dobles barras
    let normalizedPath = (filePath || '').trim();
    
    // Remover prefijos relativos si existen
    normalizedPath = normalizedPath.replace(/^\.\//, '');
    normalizedPath = normalizedPath.replace(/^\.\.\//, '');
    
    // Asegurar que empiece con /
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = `/${normalizedPath}`;
    }
    
    // Remover dobles barras (excepto después del protocolo)
    normalizedPath = normalizedPath.replace(/\/+/g, '/');
    
    const fileUrl = `${baseUrl}${normalizedPath}`;

    console.log('[downloadFile] Intentando descargar:', { 
      originalFilePath: filePath,
      normalizedPath,
      fileUrl, 
      fileName 
    });

    // Intentar descargar usando fetch y blob (más confiable)
    try {
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`Error al obtener el archivo: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Crear un elemento <a> temporal para descargar el archivo
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'documento.pdf';
      
      // Agregar al DOM, hacer click, y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar el objeto URL después de un breve delay
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (fetchError) {
      console.warn('[downloadFile] Error con fetch, intentando método alternativo:', fetchError);
      
      // Fallback: usar método directo (puede funcionar si el archivo está en el mismo origen)
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'documento.pdf';
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (err) {
    console.error('Error al descargar el archivo:', err);
    throw new Error('No se pudo descargar el archivo: ' + (err.message || 'Error desconocido'));
  }
};
