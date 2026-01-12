import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { TURNOS_VALUES } from '../../../domain/constants/cursos.constants.js';

export const Paralelo = sequelize.define(
  'Paralelo',
  {
    ...baseModelFields,
    carreraId: {
      type: DataTypes.INTEGER,
      field: 'carrera_id',
      allowNull: true,
      comment: 'Carrera a la que pertenece este paralelo (redundancia útil para performance)',
    },
    periodoId: {
      type: DataTypes.INTEGER,
      field: 'periodo_id',
      allowNull: true,
      comment: 'Periodo (año académico) del plan de estudios: Primer Año, Segundo Año, Tercer Año',
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Nombre del paralelo (ej: PRIMERO A, SEGUNDO B, TERCERO A)',
    },
    turno: {
      type: DataTypes.ENUM(...TURNOS_VALUES),
      allowNull: false,
      comment: 'Turno horario del paralelo',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción informativa del paralelo',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'paralelos',
  }
);

export default Paralelo;
