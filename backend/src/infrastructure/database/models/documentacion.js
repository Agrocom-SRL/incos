import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const Documentacion = sequelize.define(
  'Documentacion',
  {
    ...baseModelFields,
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Nombre del documento requerido',
    },
    tipoDocumento: {
      type: DataTypes.ENUM(
        'INSCRIPCION',
        'LICENCIA',
        'PASANTIA',
        'DESCUENTO',
        'TITULACION',
        'TRASPASO',
        'TRANSFERENCIA',
        'OTRO'
      ),
      field: 'tipo_documento',
      allowNull: false,
      comment: 'Tipo de documento según categoría',
    },
    aceptaFotocopia: {
      type: DataTypes.BOOLEAN,
      field: 'acepta_fotocopia',
      defaultValue: false,
      comment: 'Indica si se acepta fotocopia del documento',
    },
    requerido: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Indica si el documento es requerido',
    },
    orden: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Orden de visualización en el formulario',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción adicional del documento requerido',
    },
    documentoPadreId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'documento_padre_id',
      comment: 'ID del documento padre al que reemplaza',
      references: {
        model: 'documentacion',
        key: 'id',
      },
    },
    esOriginal: {
      type: DataTypes.BOOLEAN,
      field: 'es_original',
      defaultValue: false,
      comment: 'Indica si el documento debe ser original',
    },
    esDocumentoSistema: {
      type: DataTypes.BOOLEAN,
      field: 'es_documento_sistema',
      defaultValue: false,
      comment: 'Indica si el documento es generado automáticamente por el sistema',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'documentacion',
  }
);

export default Documentacion;

