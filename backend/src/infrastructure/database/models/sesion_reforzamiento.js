import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  MODALIDADES_SESION_REFORZAMIENTO,
  MODALIDADES_SESION_REFORZAMIENTO_VALUES,
  ESTADOS_SESION_REFORZAMIENTO,
  ESTADOS_SESION_REFORZAMIENTO_VALUES,
} from '../../../domain/constants/tutorias.constants.js';

/**
 * Sesión de reforzamiento pedagógico (módulo TUT) — tabla
 * `sesiones_reforzamiento`. Anclada en asignaciones_docentes: de ahí derivan
 * docente, materia, paralelo y gestión (cadena académica no negociable).
 */
export const SesionReforzamiento = sequelize.define(
  'SesionReforzamiento',
  {
    ...baseModelFields,
    asignacionDocenteId: {
      type: DataTypes.INTEGER,
      field: 'asignacion_docente_id',
      allowNull: true,
      comment: 'Curso que refuerza (referencia a asignaciones_docentes)',
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Fecha de la sesión',
    },
    horaInicio: {
      type: DataTypes.TIME,
      field: 'hora_inicio',
      allowNull: true,
      comment: 'Hora de inicio',
    },
    horaFin: {
      type: DataTypes.TIME,
      field: 'hora_fin',
      allowNull: true,
      comment: 'Hora de fin',
    },
    modalidad: {
      type: DataTypes.ENUM(...MODALIDADES_SESION_REFORZAMIENTO_VALUES),
      allowNull: true,
      defaultValue: MODALIDADES_SESION_REFORZAMIENTO.PRESENCIAL,
      comment: 'PRESENCIAL: en aula física | VIRTUAL: por enlace',
    },
    aulaId: {
      type: DataTypes.INTEGER,
      field: 'aula_id',
      allowNull: true,
      comment: 'Aula física (referencia a aulas). NULL si es virtual',
    },
    enlaceVirtual: {
      type: DataTypes.STRING(500),
      field: 'enlace_virtual',
      allowNull: true,
      comment: 'Enlace de la sesión virtual. NULL si es presencial',
    },
    tema: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Tema o contenido a reforzar',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_SESION_REFORZAMIENTO_VALUES),
      allowNull: true,
      defaultValue: ESTADOS_SESION_REFORZAMIENTO.PROGRAMADA,
      comment: 'PROGRAMADA | REALIZADA | CANCELADA',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones generales de la sesión',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'sesiones_reforzamiento',
  }
);

export default SesionReforzamiento;
