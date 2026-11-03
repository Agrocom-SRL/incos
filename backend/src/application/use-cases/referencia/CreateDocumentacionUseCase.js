import { ValidationError } from '../../../domain/errors/AppError.js';
import { TIPOS_DOCUMENTO_SISTEMA_VALUES } from '../../../domain/constants/index.js';
import { parseIdOpcional, primerDefinido } from '../../utils/validacionEntrada.js';

export class CreateDocumentacionUseCase {
  constructor({ documentacionRepository, logger }) {
    this.documentacionRepository = documentacionRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const nombre = body.nombre ?? body.name ?? null;
    if (!nombre) throw new ValidationError('nombre es requerido');

    const tipoDocumento = body.tipoDocumento ?? body.documentType ?? null;
    if (!tipoDocumento) throw new ValidationError('tipoDocumento es requerido');
    if (!TIPOS_DOCUMENTO_SISTEMA_VALUES.includes(tipoDocumento)) {
      throw new ValidationError(
        `tipoDocumento inválido. Valores permitidos: ${TIPOS_DOCUMENTO_SISTEMA_VALUES.join(', ')}`
      );
    }

    // null / '' / ausente = sin padre; 0, negativos o texto no numérico son inválidos (ValidationError)
    const documentoPadreId = parseIdOpcional(primerDefinido(body, 'documentoPadreId', 'parentDocumentId'), 'documentoPadreId');
    if (documentoPadreId !== null) {
      await this.validarDocumentoPadre(documentoPadreId, tipoDocumento);
    }

    const created = await this.documentacionRepository.create(
      {
        name: nombre,
        documentType: tipoDocumento,
        acceptsPhotocopy: body.aceptaFotocopia ?? body.acceptsPhotocopy ?? false,
        required: body.requerido ?? body.required ?? true,
        order: body.orden ?? body.order ?? 0,
        description: body.descripcion ?? body.description ?? undefined,
        parentDocumentId: documentoPadreId ?? undefined,
        active: body.activo ?? body.active ?? true,
      },
      userId
    );

    this.logger.info('Tipo de documentación creado', { id: created.id });
    return { documentacion: created };
  }

  /**
   * Reglas de negocio del documento padre (documentoPadreId):
   * - Debe existir
   * - Debe pertenecer al MISMO tipoDocumento
   * - No puede ser un documento generado por el sistema (esDocumentoSistema)
   *
   * @param {number} documentoPadreId
   * @param {string} tipoDocumento - tipoDocumento del registro que se está creando/editando
   * @param {number|null} idEnEdicion - id del registro en edición (para evitar auto-referencia)
   */
  async validarDocumentoPadre(documentoPadreId, tipoDocumento, idEnEdicion = null) {
    if (idEnEdicion && Number(documentoPadreId) === Number(idEnEdicion)) {
      throw new ValidationError('documentoPadreId no puede ser el mismo documento');
    }

    const padre = await this.documentacionRepository.findById(documentoPadreId);
    if (!padre) {
      throw new ValidationError('documentoPadreId no corresponde a un documento existente');
    }
    if (padre.documentType !== tipoDocumento) {
      throw new ValidationError('documentoPadreId debe pertenecer al mismo tipoDocumento');
    }
    if (padre.isSystemDocument) {
      throw new ValidationError('documentoPadreId no puede ser un documento generado por el sistema');
    }
  }
}
