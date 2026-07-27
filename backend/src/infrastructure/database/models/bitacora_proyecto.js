import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  TIPOS_BITACORA_TUTORIA,
  TIPOS_BITACORA_TUTORIA_VALUES,
  ESTADOS_BITACORA_TUTORIA,
  ESTADOS_BITACORA_TUTORIA_VALUES,
} from '../../../domain/constants/tutorias.constants.js';

/**
 * Entrada de bitácora de tutoría (módulo TUT) — tabla `bitacora_proyecto`.
 * Fuente de la planilla de seguimiento (FECHA/ACTIVIDAD/OBSERVACIONES/FIRMA)
 * y del reporte mensual del tutor a la Dirección Académica (vista 163).
 */
export const BitacoraProyecto = sequelize.define(
  'BitacoraProyecto',
  {
    ...baseModelFields,
    proyectoGradoId: {
      type: DataTypes.INTEGER,
      field: 'proyecto_grado_id',
      allowNull: true,
      comment: 'Proyecto de grado (referencia a proyectos_grado)',
    },
    avanceProyectoId: {
      type: DataTypes.INTEGER,
      field: 'avance_proyecto_id',
      allowNull: true,
      comment: 'Avance revisado en esta entrada (NULL si es reunión sin archivo)',
    },
    tipo: {
      type: DataTypes.ENUM(...TIPOS_BITACORA_TUTORIA_VALUES),
      allowNull: true,
      defaultValue: TIPOS_BITACORA_TUTORIA.REUNION,
      comment: 'REUNION: sesión de tutoría | REVISION_AVANCE: observación sobre un avance',
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Fecha de la reunión/revisión (columna FECHA de la planilla)',
    },
    actividad: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Avance revisado en relación al Cronograma de Tutoría',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones del tutor',
    },
    porcentajeAvance: {
      type: DataTypes.TINYINT.UNSIGNED,
      field: 'porcentaje_avance',
      allowNull: true,
      comment: 'Porcentaje de avance del proyecto a la fecha (0-100)',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_BITACORA_TUTORIA_VALUES),
      allowNull: true,
      defaultValue: ESTADOS_BITACORA_TUTORIA.PENDIENTE,
      comment: 'PENDIENTE: observación abierta | SUBSANADO: atendida',
    },
    confirmadoEstudiante: {
      type: DataTypes.BOOLEAN,
      field: 'confirmado_estudiante',
      allowNull: true,
      defaultValue: false,
      comment: 'Equivalente digital de FIRMA DEL ESTUDIANTE en la planilla',
    },
    fechaConfirmacion: {
      type: DataTypes.DATEONLY,
      field: 'fecha_confirmacion',
      allowNull: true,
      comment: 'Fecha en que el estudiante confirmó la entrada',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'bitacora_proyecto',
  }
);

export default BitacoraProyecto;
