/**
 * estudianteDocumentacionFields - Configuración de campos de documentación para el formulario de registro de estudiantes
 * 
 * Single Responsibility: Definir la configuración de campos de documentación (documentos requeridos)
 * 
 * Este archivo separa la configuración de campos de documentación de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente los campos sin tocar el componente.
 * 
 * NOTA: La lógica de procesamiento (filtrado, ordenamiento) está en el hook useDocumentacionDinamica
 * (Application Layer). Este archivo solo genera la configuración de campos (Presentation Layer).
 * 
 * Estructura de cada campo:
 * - name: Nombre del campo (debe coincidir con el nombre en el backend)
 * - label: Etiqueta visible para el usuario
 * - type: Tipo de campo (checkbox para marcar documentos entregados)
 * - required: Si el campo es obligatorio (basado en documento.required)
 * - span: Ancho del campo en columnas (12 = 50%, 24 = 100%)
 * - documentacionId: ID del documento de referencia
 * - description: Descripción del documento
 * - acceptsPhotocopy: Si acepta fotocopia
 * - esOriginal: Si debe ser original
 */

/**
 * Crea un campo de tipo documento (componente compuesto)
 * 
 * @param {Object} documento - Objeto con datos del documento (ya procesado por el hook)
 * @param {number} documento.id - ID del documento
 * @param {string} documento.name - Nombre del documento
 * @param {string} documento.description - Descripción del documento
 * @param {boolean} documento.required - Si el documento es requerido
 * @param {boolean} documento.acceptsPhotocopy - Si acepta fotocopia
 * @param {boolean} documento.esOriginal - Si debe ser original
 * @param {boolean} documento.entregado - Estado de entrega del documento
 * @returns {Object} Configuración del campo de tipo documento
 */
const createCampoDocumento = (documento) => {
  return {
    name: `documento_${documento.id}`,
    type: 'documento', // Tipo especial que se renderiza con DocumentoItem
    required: documento.required || false,
    span: 12, // Ocupa todo el ancho
    // Datos completos del documento para el componente
    documento: {
      id: documento.id,
      name: documento.name,
      description: documento.description || null,
      required: documento.required || false,
      acceptsPhotocopy: documento.acceptsPhotocopy || false,
      esOriginal: documento.esOriginal || false,
      entregado: documento.entregado || false,
    },
  };
};

/**
 * Genera los campos dinámicos de documentación basándose en los documentos procesados
 * 
 * Los campos se generan dinámicamente según los documentos de tipo INSCRIPCION
 * que se recuperan del endpoint. Cada documento tiene su propio campo de checkbox
 * para marcar si fue entregado.
 * 
 * NOTA: La documentación debe venir ya procesada del hook useDocumentacionDinamica
 * (filtrada y ordenada). Esta función solo genera la configuración de campos.
 * 
 * @param {Array} documentacionProcesada - Array de documentos ya procesados por el hook
 * @returns {Array} Array de campos dinámicos de documentación
 */
export const createCamposDocumentacionDinamicos = (documentacionProcesada = []) => {
  // Si no hay documentos, retornar array vacío
  if (!documentacionProcesada || documentacionProcesada.length === 0) {
    return [];
  }

  // Generar un campo de checkbox para cada documento
  // La documentación ya viene procesada (filtrada y ordenada) del hook
  return documentacionProcesada.map((documento) => {
    return createCampoDocumento(documento);
  });
};

/**
 * Crea la configuración de campos de documentación para el registro de estudiantes
 * 
 * Los campos de documentación se generan dinámicamente según los documentos
 * de tipo INSCRIPCION recuperados del endpoint.
 * 
 * NOTA: Esta función retorna campos estáticos vacíos. Para campos dinámicos,
 * usar createCamposDocumentacionDinamicos que genera los campos basándose
 * en los documentos recuperados del contexto.
 * 
 * @returns {Object} Configuración de campos organizados por sección
 */
export const createEstudianteDocumentacionFields = () => {
  return {
    documentacion: {
      title: 'Documentación Requerida',
      // Los campos se generan dinámicamente usando createCamposDocumentacionDinamicos
      // Este objeto solo define la estructura base
      fields: [],
    },
  };
};

