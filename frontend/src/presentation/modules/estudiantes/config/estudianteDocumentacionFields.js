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
 * - name: Nombre del campo en formato de array para campos anidados
 *   Ejemplo: ['documentacion', 1, 'entregado'] para documentacion[1].entregado
 *   Esto permite que los datos se guarden como un array multidimensional en el formulario
 * - label: Etiqueta visible para el usuario
 * - type: Tipo de campo (documento - componente compuesto)
 * - required: Si el campo es obligatorio (basado en documento.required)
 * - span: Ancho del campo en columnas (12 = 50%, 24 = 100%)
 * - documentacionId: ID del documento de referencia
 * - description: Descripción del documento
 * - acceptsPhotocopy: Si acepta fotocopia
 * 
 * Estructura de datos resultante:
 * Los datos se guardarán en el formato:
 * {
 *   documentacion: {
 *     1: {
 *       entregado: true,
 *       en_tramite: false,
 *       observaciones: "..."
 *     },
 *     2: {
 *       entregado: false,
 *       en_tramite: true,
 *       observaciones: "..."
 *     }
 *   }
 * }
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
 * @param {boolean} documento.entregado - Estado de entrega del documento
 * @returns {Object} Configuración del campo de tipo documento
 */
const createCampoDocumento = (documento) => {
  // Usar estructura de array con prefijo no numérico para garantizar que se cree como objeto
  // Usar 'doc_' + id para evitar que Ant Design interprete keys numéricos como índices de array
  // Formato: ['documentacion', 'doc_1', 'campo'] crea documentacion['doc_1'].campo (objeto garantizado)
  const basePath = ['documentacion', `doc_${documento.id}`];

  return {
    name: basePath, // Array notation para Ant Design Form (con string key para crear objeto)
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
      entregado: documento.entregado || false,
      en_tramite: documento.en_tramite || false,
      observaciones: documento.observaciones ?? null,
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

  // Evitar duplicados por id para que las keys de React (documentacion,doc_X) sean únicas
  const seenIds = new Set();
  const unicos = documentacionProcesada.filter((doc) => {
    const id = doc?.id ?? doc;
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });

  return unicos.map((documento) => createCampoDocumento(documento));
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
      title: 'DOCUMENTACIÓN REQUERIDA',
      // Los campos se generan dinámicamente usando createCamposDocumentacionDinamicos
      // Este objeto solo define la estructura base
      fields: [],
    },
  };
};

