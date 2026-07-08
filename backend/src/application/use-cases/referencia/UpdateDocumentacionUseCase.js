import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { TIPOS_DOCUMENTO_SISTEMA_VALUES } from '../../../domain/constants/index.js';

export class UpdateDocumentacionUseCase {
  constructor({ documentacionRepository, logger }) {
    this.documentacionRepository = documentacionRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const existing = await this.documentacionRepository.findById(id);
    if (!existing) throw new NotFoundError('tipo de documentación');

    const tipoDocumento = body.tipoDocumento ?? body.documentType ?? undefined;
    if (tipoDocumento !== undefined && !TIPOS_DOCUMENTO_SISTEMA_VALUES.includes(tipoDocumento)) {
      throw new ValidationError(
        `tipoDocumento inválido. Valores permitidos: ${TIPOS_DOCUMENTO_SISTEMA_VALUES.join(', ')}`
      );
    }
    const tipoDocumentoEfectivo = tipoDocumento ?? existing.documentType;

    const documentoPadreId = body.documentoPadreId ?? body.parentDocumentId ?? undefined;
    if (documentoPadreId !== undefined && documentoPadreId !== null) {
      await this.validarDocumentoPadre(documentoPadreId, tipoDocumentoEfectivo, id);
    }

    const updated = await this.documentacionRepository.update(
      id,
      {
        name: body.nombre ?? body.name ?? undefined,
        documentType: tipoDocumento,
        acceptsPhotocopy: body.aceptaFotocopia ?? body.acceptsPhotocopy ?? undefined,
        required: body.requerido ?? body.required ?? undefined,
        order: body.orden ?? body.order ?? undefined,
        description: body.descripcion ?? body.description ?? undefined,
        parentDocumentId: documentoPadreId,
        active: body.activo ?? body.active ?? undefined,
      },
      userId
    );

    this.logger.info('Tipo de documentación actualizado', { id });
    return { documentacion: updated };
  }

  /**
   * Reglas de negocio del documento padre (documentoPadreId):
   * - No puede ser el propio registro en edición
   * - Debe existir
   * - Debe pertenecer al MISMO tipoDocumento
   * - No puede ser un documento generado por el sistema (esDocumentoSistema)
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
