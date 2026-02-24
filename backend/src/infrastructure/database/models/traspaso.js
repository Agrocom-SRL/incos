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
        'ITT de origen donde el estudiante cursó estudios previos (referencia a instituciones)',
    },
    carreraOrigen: {
      type: DataTypes.STRING(200),
      field: 'carrera_origen',
      allowNull: false,
      comment: 'Nombre de la carrera cursada en el ITT de origen',
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
    tieneActaCompromiso: {
      type: DataTypes.BOOLEAN,
      field: 'tiene_acta_compromiso',
      allowNull: false,
      defaultValue: false,
      comment:
        'TRUE si se generó acta de compromiso por no presentar alguno de los últimos 3 documentos requeridos',
    },
    fechaActaCompromiso: {
      type: DataTypes.DATEONLY,
      field: 'fecha_acta_compromiso',
      allowNull: true,
      comment: 'Fecha en que se generó y firmó el acta de compromiso',
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
      comment: 'Fecha en que el postulante presentó la solicitud',
    },
    fechaResolucion: {
      type: DataTypes.DATEONLY,
      field: 'fecha_resolucion',
      allowNull: true,
      comment: 'Fecha en que la Dirección Académica emitió la resolución',
    },
    resueltoPor: {
      type: DataTypes.INTEGER,
      field: 'resuelto_por',
      allowNull: true,
      comment: 'Usuario (director académico) que resolvió la solicitud (referencia a usuarios)',
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
    carreraDestinoId: {
      type: DataTypes.INTEGER,
      field: 'carrera_destino_id',
      allowNull: true,
      comment: 'Carrera en INCOS a la que ingresará si es Procedente (referencia a carreras)',
    },
    planEstudioDestinoId: {
      type: DataTypes.INTEGER,
      field: 'plan_estudio_destino_id',
      allowNull: true,
      comment: 'Plan de estudios en INCOS (referencia a planes_estudios)',
    },
    periodoDestinoId: {
      type: DataTypes.INTEGER,
      field: 'periodo_destino_id',
      allowNull: true,
      comment: 'Periodo académico al que ingresa en INCOS (referencia a periodos)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'traspasos',
  }
);

export default Traspaso;

