import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

/**
 * Grupo (tipo «paralelo») de un curso de capacitación (módulo CAP) — tabla
 * `capacitacion_grupos`. El participante se inscribe a un grupo; los horarios
 * del grupo viven en `capacitacion_horarios.grupo_id`.
 */
export const GrupoCapacitacion = sequelize.define(
  'GrupoCapacitacion',
  {
    ...baseModelFields,
    capacitacionId: {
      type: DataTypes.INTEGER,
      field: 'capacitacion_id',
      allowNull: true,
      comment: 'Curso de capacitación',
    },
    nombre: {
      type: DataTypes.STRING(60),
      allowNull: false,
      comment: 'Nombre del grupo (ej: Grupo 1 – Mañana)',
    },
    cupoMaximo: {
      type: DataTypes.INTEGER,
      field: 'cupo_maximo',
      allowNull: true,
      comment: 'Cupo del grupo; NULL = usa el cupo del curso',
    },
    aulaId: {
      type: DataTypes.INTEGER,
      field: 'aula_id',
      allowNull: true,
      comment: 'Aula del grupo (catálogo aulas, opcional)',
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Orden de presentación',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'capacitacion_grupos',
  }
);

export default GrupoCapacitacion;
