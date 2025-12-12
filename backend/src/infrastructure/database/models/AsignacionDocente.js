import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const AsignacionDocente = sequelize.define(
  'AsignacionDocente',
  {
    ...baseModelFields,
    cursoId: {
      type: DataTypes.INTEGER,
      field: 'curso_id',
      allowNull: true,
      comment: 'Curso (paralelo/grupo) que se oferta',
    },
    gestionId: {
      type: DataTypes.INTEGER,
      field: 'gestion_id',
      allowNull: true,
      comment: 'Gestión académica en la que se oferta',
    },
    docenteId: {
      type: DataTypes.INTEGER,
      field: 'docente_id',
      allowNull: true,
      comment: 'Docente asignado',
    },
    cargaHorariaSemanal: {
      type: DataTypes.INTEGER,
      field: 'carga_horaria_semanal',
      allowNull: false,
      defaultValue: 0,
      comment: 'Horas semanales',
    },
    estado: {
      type: DataTypes.ENUM('PROPUESTA', 'APROBADA', 'ABIERTA', 'CERRADA', 'CANCELADA'),
      defaultValue: 'PROPUESTA',
      comment: 'Estado de la oferta',
    },
    motivoCancelacion: {
      type: DataTypes.TEXT,
      field: 'motivo_cancelacion',
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    ...baseModelOptions,
    tableName: 'asignaciones_docentes',
  }
);

export default AsignacionDocente;
