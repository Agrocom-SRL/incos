import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

/**
 * Modelo Sequelize: Traspaso
 * Tabla: traspasos
 * Basado en 16-traspasos.sql
 */
export const Traspaso = sequelize.define(
  'Traspaso',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante postulante (referencia a estudiantes)',
    },
    institucionOrigenId: {
      type: DataTypes.INTEGER,
      field: 'institucion_origen_id',
      allowNull: true,
      comment:
        'ITT de origen donde el estudiante cursó estudios previos (referencia a instituciones; el nombre está en instituciones.nombre)',
    },
    carreraOrigen: {
      type: DataTypes.STRING(200),
      field: 'carrera_origen',
      allowNull: true,
      comment: 'Nombre de la carrera cursada en el ITT de origen (opcional)',
    },
    anioCursado: {
      type: DataTypes.ENUM('PRIMERO', 'SEGUNDO'),
      field: 'anio_cursado',
      allowNull: false,
      comment:
        'Año que completó en el ITT de origen: PRIMERO (primer año) o SEGUNDO (segundo año)',
    },
    regimenOrigen: {
      type: DataTypes.ENUM('SEMESTRAL', 'ANUAL'),
      field: 'regimen_origen',
      allowNull: true,
      comment: 'Régimen de estudios en el ITT de origen: SEMESTRAL o ANUAL',
    },
    estado: {
      type: DataTypes.ENUM('SOLICITADO', 'EN_REVISION', 'PROCEDENTE', 'NO_PROCEDENTE'),
      allowNull: false,
      defaultValue: 'SOLICITADO',
      comment:
        'Estado de la solicitud: SOLICITADO (recibido), EN_REVISION (en análisis), PROCEDENTE (aprobado), NO_PROCEDENTE (rechazado)',
    },
    fechaSolicitud: {
      type: DataTypes.DATEONLY,
      field: 'fecha_solicitud',
      allowNull: true,
      comment: 'Fecha en que el postulante presentó la solicitud, si se desea registrar',
    },
    motivoNoProcedente: {
      type: DataTypes.TEXT,
      field: 'motivo_no_procedente',
      allowNull: true,
      comment: 'Motivo por el que la solicitud fue declarada No Procedente',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones adicionales de la revisión académica',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'traspasos',
  }
);

export default Traspaso;

