import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { DIAS_SEMANA_VALUES, TURNOS_VALUES, TIPOS_HORARIO_VALUES, TIPOS_HORARIO } from '../../../domain/constants/cursos.constants.js';

export const Horario = sequelize.define(
  'Horario',
  {
    ...baseModelFields,
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Nombre descriptivo (ej: BLOQUE 1 - NOCHE, Inauguración 2025, Feriado Nacional)',
    },
    dia: {
      type: DataTypes.ENUM(...DIAS_SEMANA_VALUES),
      allowNull: true,
      comment: 'Día de la semana (NULL = cualquier día o no aplica)',
    },
    horaInicio: {
      type: DataTypes.TIME,
      field: 'hora_inicio',
      allowNull: true,
      comment: 'Hora de inicio del bloque (NULL = todo el día o no aplica)',
    },
    horaFin: {
      type: DataTypes.TIME,
      field: 'hora_fin',
      allowNull: true,
      comment: 'Hora de fin del bloque (NULL = todo el día o no aplica)',
    },
    turno: {
      type: DataTypes.ENUM(...TURNOS_VALUES),
      allowNull: true,
      comment: 'Turno al que pertenece este bloque (NULL si no aplica)',
    },
    numeroBloque: {
      type: DataTypes.INTEGER,
      field: 'numero_bloque',
      allowNull: true,
      comment: 'Número del bloque dentro del turno (1, 2, 3, 4, 5) (NULL si no aplica)',
    },
    tipoHorario: {
      type: DataTypes.ENUM(...TIPOS_HORARIO_VALUES),
      field: 'tipo_horario',
      defaultValue: TIPOS_HORARIO.CLASES,
      comment: 'CLASES: bloques de 45 min | EVENTOS: horarios personalizados | FERIADOS: día completo | CAPACITACION: horarios especiales',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'horarios',
  }
);

export default Horario;
