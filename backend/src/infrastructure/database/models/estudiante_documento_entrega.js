import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const EstudianteDocumentoEntrega = sequelize.define(
  'EstudianteDocumentoEntrega',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante',
    },
    documentacionId: {
      type: DataTypes.INTEGER,
      field: 'documentacion_id',
      allowNull: true,
      comment: 'Tipo de documentación requerida (referencia a documentacion)',
    },
    entregado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indica si el documento fue entregado físicamente (TRUE) o no (FALSE)',
    },
    enTramite: {
      type: DataTypes.BOOLEAN,
      field: 'en_tramite',
      defaultValue: false,
      comment: 'Indica si el documento está en trámite. Si es TRUE, el estudiante puede registrar aunque no lo tenga físicamente, pero debe presentarlo posteriormente',
    },
    esOriginal: {
      type: DataTypes.BOOLEAN,
      field: 'es_original',
      defaultValue: false,
      comment: 'Indica si el documento entregado es original (TRUE) o fotocopia (FALSE). Solo aplica si entregado = TRUE y en_tramite = FALSE.',
    },
    fechaEntrega: {
      type: DataTypes.DATEONLY,
      field: 'fecha_entrega',
      allowNull: true,
      comment: 'Fecha en que se entregó físicamente el documento',
    },
    fechaVencimientoTramite: {
      type: DataTypes.DATEONLY,
      field: 'fecha_vencimiento_tramite',
      allowNull: true,
      comment: 'Fecha límite para entregar el documento si está en trámite (ej: 10 días desde el registro)',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones adicionales sobre la entrega del documento (incluye motivo de trámite si aplica)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'estudiantes_documentos_entrega',
  }
);

export default EstudianteDocumentoEntrega;

