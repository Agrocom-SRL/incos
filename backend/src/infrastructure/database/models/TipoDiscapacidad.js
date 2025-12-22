import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const TipoDiscapacidad = sequelize.define(
  'TipoDiscapacidad',
  {
    ...baseModelFields,
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Visual, Auditiva, Motriz, Intelectual, Psicosocial, Múltiple, Otra',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción del tipo de discapacidad',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'tipos_discapacidad',
  }
);

export default TipoDiscapacidad;
