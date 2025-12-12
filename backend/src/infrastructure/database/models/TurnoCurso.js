import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const TurnoCurso = sequelize.define(
  'TurnoCurso',
  {
    ...baseModelFields,
    asignacionId: {
      type: DataTypes.INTEGER,
      field: 'asignacion_id',
      allowNull: true,
      comment: 'Oferta del curso en la gestión (asignaciones_docentes)',
    },
    turnoId: {
      type: DataTypes.INTEGER,
      field: 'turno_id',
      allowNull: true,
      comment: 'Turno horario (Mañana/Tarde/Noche)',
    },
    diaSemana: {
      type: DataTypes.ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'),
      field: 'dia_semana',
      allowNull: false,
      comment: 'Día de la semana',
    },
    horaInicio: {
      type: DataTypes.TIME,
      field: 'hora_inicio',
      allowNull: false,
      comment: 'Hora de inicio',
    },
    horaFin: {
      type: DataTypes.TIME,
      field: 'hora_fin',
      allowNull: false,
      comment: 'Hora de fin',
    },
    aula: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Aula asignada para este día',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'turnos_cursos',
  }
);

export default TurnoCurso;
