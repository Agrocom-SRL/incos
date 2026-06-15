import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const AsignacionDocente = sequelize.define(
  'AsignacionDocente',
  {
    ...baseModelFields,
    gestionPlanId: {
      type: DataTypes.INTEGER,
      field: 'gestion_plan_id',
      allowNull: true,
      comment: 'Plan habilitado en la gestión (garantiza que curso pertenece al plan correcto)',
    },
    ofertaCursoId: {
      type: DataTypes.INTEGER,
      field: 'oferta_curso_id',
      allowNull: true,
      comment: 'Oferta de curso (paralelo_gestion + asignatura_plan) que se dicta',
    },
    docenteId: {
      type: DataTypes.INTEGER,
      field: 'docente_id',
      allowNull: true,
      comment: 'Docente asignado (NULL = pendiente de asignación)',
    },
    cargaHoraria: {
      type: DataTypes.INTEGER,
      field: 'carga_horaria',
      allowNull: true,
      comment: 'Horas de docencia por semana en este curso (hereda de asignaturas_plan.horas_semanales si NULL)',
    },
    vigente: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si la asignación está vigente (FALSE = cancelada o rechazada)',
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo de cancelación o rechazo (solo si vigente=FALSE)',
    },
    fechaAsignacion: {
      type: DataTypes.DATEONLY,
      field: 'fecha_asignacion',
      allowNull: true,
      comment: 'Fecha en que se asignó el docente',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'asignaciones_docentes',
  }
);

export default AsignacionDocente;
