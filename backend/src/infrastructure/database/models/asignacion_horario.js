import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const AsignacionHorario = sequelize.define(
  'AsignacionHorario',
  {
    ...baseModelFields,
    asignacionDocenteId: {
      type: DataTypes.INTEGER,
      field: 'asignacion_docente_id',
      allowNull: true,
      comment: 'Asignación docente (oferta + docente)',
    },
    horarioId: {
      type: DataTypes.INTEGER,
      field: 'horario_id',
      allowNull: true,
      comment: 'Bloque del catálogo horarios',
    },
    aulaId: {
      type: DataTypes.INTEGER,
      field: 'aula_id',
      allowNull: true,
      comment: 'Aula del bloque; NULL hereda aula base del paralelo_gestion',
    },
    ordenSecuencia: {
      type: DataTypes.INTEGER,
      field: 'orden_secuencia',
      allowNull: false,
      defaultValue: 1,
      comment: 'Orden cronológico del bloque en la semana',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'asignacion_horarios',
  }
);

export default AsignacionHorario;
