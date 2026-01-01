import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const TipoParentesco = sequelize.define(
  'TipoParentesco',
  {
    ...baseModelFields,
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Padre, Madre, Abuelo(a), Tío(a), Hermano(a), Tutor(a), Apoderado(a), Orfanato, Otro',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción del tipo de parentesco',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'tipos_parentesco',
  }
);

export default TipoParentesco;
