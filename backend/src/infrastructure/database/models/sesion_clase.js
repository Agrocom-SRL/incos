import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_SESION_CLASE_VALUES } from '../../../domain/constants/asistencia.constants.js';

/**
 * Sesión de clase en que el docente tomó asistencia. 1 fila = 1 curso × 1 fecha.
 * Su EXISTENCIA marca el día tomado (dot del calendario + denominador del %);
 * su `estado` gobierna el cierre/reapertura (ABIERTA/CERRADA).
 * Las marcas (`asistencias`) cuelgan de `sesion_clase_id`.
 */
export const SesionClase = sequelize.define(
  'SesionClase',
  {
    ...baseModelFields,

    asignacionDocenteId: {
      type: DataTypes.INTEGER,
      field: 'asignacion_docente_id',
      allowNull: true,
      comment: 'Asignación docente (curso) de la sesión',
    },

    periodoAcademicoId: {
      type: DataTypes.INTEGER,
      field: 'periodo_academico_id',
      allowNull: true,
      comment: 'Bimestre del calendario (periodos_academicos, division=BIMESTRE)',
    },

    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Fecha de la sesión',
    },

    horaInicio: {
      type: DataTypes.TIME,
      field: 'hora_inicio',
      allowNull: true,
      comment: 'Hora de inicio (opcional; derivable del horario en sesiones regulares)',
    },

    horaFin: {
      type: DataTypes.TIME,
      field: 'hora_fin',
      allowNull: true,
      comment: 'Hora de fin (opcional)',
    },

    esEspecial: {
      type: DataTypes.BOOLEAN,
      field: 'es_especial',
      allowNull: false,
      defaultValue: false,
      comment: 'TRUE = sesión fuera de horario (taller/recuperación)',
    },

    motivo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Motivo cuando es_especial = TRUE',
    },

    estado: {
      type: DataTypes.ENUM(...ESTADOS_SESION_CLASE_VALUES),
      allowNull: false,
      defaultValue: 'ABIERTA',
      comment: 'ABIERTA (editable) / CERRADA (registro cerrado del bimestre)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'sesiones_clase',
  }
);

export default SesionClase;
