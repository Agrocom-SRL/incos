import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

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
  },
  {
    ...baseModelOptions,
    tableName: 'documentacion',
  }
);

export default Documentacion;

