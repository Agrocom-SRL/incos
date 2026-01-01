import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const Turno = sequelize.define(
  'Turno',
  {
    ...baseModelFields,
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'MAÑANA, TARDE, NOCHE',
    },
    horaInicio: {
      type: DataTypes.TIME,
      field: 'hora_inicio',
      allowNull: false,
      comment: '07:00, 14:00, 19:00',
    },
    horaFin: {
      type: DataTypes.TIME,
      field: 'hora_fin',
      allowNull: false,
      comment: '12:00, 18:00, 22:00',
    },
    descripcion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    colorHex: {
      type: DataTypes.STRING(7),
      field: 'color_hex',
      allowNull: true,
      comment: 'Color para UI (#FF5733)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'turnos',
  }
);

export default Turno;
