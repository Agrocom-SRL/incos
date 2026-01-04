import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const Permiso = sequelize.define(
  'Permiso',
  {
    ...baseModelFields,
    codigo: {
      type: DataTypes.STRING(250),
      allowNull: false,
      comment: 'estudiantes.ver, calificaciones.registrar',
    },
    modulo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'ESTUDIANTES, INSCRIPCIONES, CALIFICACIONES, etc.',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'permisos',
  }
);

export default Permiso;
