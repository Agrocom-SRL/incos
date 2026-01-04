import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const Prerrequisito = sequelize.define(
  'Prerrequisito',
  {
    ...baseModelFields,
    materiaId: {
      type: DataTypes.INTEGER,
      field: 'materia_id',
      allowNull: true,
      comment: 'Materia que tiene el prerrequisito',
    },
    materiaPrerrequisitoId: {
      type: DataTypes.INTEGER,
      field: 'materia_prerrequisito_id',
      allowNull: true,
      comment: 'Materia que debe aprobarse antes',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción adicional del prerrequisito',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'prerrequisitos',
  }
);

export default Prerrequisito;
