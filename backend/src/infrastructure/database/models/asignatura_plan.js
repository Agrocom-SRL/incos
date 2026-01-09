import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const AsignaturaPlan = sequelize.define(
  'AsignaturaPlan',
  {
    ...baseModelFields,
    planEstudioId: {
      type: DataTypes.INTEGER,
      field: 'plan_estudio_id',
      allowNull: true,
      comment: 'Plan de estudios (redundancia controlada para performance en queries)',
    },
    periodoId: {
      type: DataTypes.INTEGER,
      field: 'periodo_id',
      allowNull: true,
      comment: 'Periodo (año académico) donde se cursa la materia',
    },
    materiaId: {
      type: DataTypes.INTEGER,
      field: 'materia_id',
      allowNull: true,
      comment: 'Materia asignada a este periodo',
    },
    horasSemanales: {
      type: DataTypes.INTEGER,
      field: 'horas_semanales',
      allowNull: false,
      comment: 'Horas semanales totales según el plan (del documento oficial)',
    },
    creditos: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Créditos académicos de la materia en este plan',
    },
    modalidad: {
      type: DataTypes.ENUM('TRONCAL', 'ELECTIVA', 'REGULAR'),
      allowNull: false,
      defaultValue: 'REGULAR',
      comment: 'TRONCAL: materia fundamental de la carrera, ELECTIVA: a elección del estudiante, REGULAR: materia estándar del plan',
    },
    ordenVisualizacion: {
      type: DataTypes.INTEGER,
      field: 'orden_visualizacion',
      allowNull: false,
      defaultValue: 1,
      comment: 'Orden de presentación dentro del periodo',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'asignaturas_plan',
  }
);

export default AsignaturaPlan;
