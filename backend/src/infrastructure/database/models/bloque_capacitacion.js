import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

/**
 * Bloque horario de una capacitación (módulo CAP) — junction
 * `capacitacion_horarios`: grupo de capacitación ↔ horarios (catálogo reutilizado,
 * tipo_horario='CAPACITACION'). El aula NO vive aquí sino en
 * `capacitaciones.aula_id`.
 */
export const BloqueCapacitacion = sequelize.define(
  'BloqueCapacitacion',
  {
    ...baseModelFields,
    capacitacionId: {
      type: DataTypes.INTEGER,
      field: 'capacitacion_id',
      allowNull: true,
      comment: 'Curso de capacitación',
    },
    grupoId: {
      type: DataTypes.INTEGER,
      field: 'grupo_id',
      allowNull: true,
      comment: 'Grupo del bloque (capacitacion_grupos.id); NULL = común a todos los grupos',
    },
    horarioId: {
      type: DataTypes.INTEGER,
      field: 'horario_id',
      allowNull: true,
      comment: 'Bloque día/hora (horarios.id, tipo_horario=CAPACITACION)',
    },
    ordenSecuencia: {
      type: DataTypes.INTEGER,
      field: 'orden_secuencia',
      allowNull: false,
      defaultValue: 1,
      comment: 'Orden cronológico durante la semana',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'capacitacion_horarios',
  }
);

export default BloqueCapacitacion;
