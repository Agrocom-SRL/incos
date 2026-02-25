import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

/**
 * Modelo Sequelize: Transitabilidad
 * Tabla: transitabilidades
 * Basado en 15-transitabilidades.sql
 */
export const Transitabilidad = sequelize.define(
  'Transitabilidad',
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
      comment: 'Institución de origen donde obtuvo el Técnico Medio (referencia a instituciones)',
    },
    carreraOrigen: {
      type: DataTypes.STRING(200),
      field: 'carrera_origen',
      allowNull: false,
      comment: 'Nombre de la carrera cursada en la institución de origen',
    },
    anioConclusion: {
      type: DataTypes.INTEGER,
      field: 'anio_conclusion',
      allowNull: true,
      comment: 'Año de conclusión de estudios en la institución de origen',
    },
    regimenEstudios: {
      type: DataTypes.ENUM('SEMESTRAL', 'ANUAL'),
      field: 'regimen_estudios',
      allowNull: true,
      comment: 'Régimen de estudios de la carrera destino: SEMESTRAL o ANUAL',
    },
    aceptaCompromiso: {
      type: DataTypes.BOOLEAN,
      field: 'acepta_compromiso',
      allowNull: false,
      defaultValue: false,
      comment:
        'El postulante acepta cumplir las normativas vigentes del ITT (corresponde al punto 3 del formulario)',
    },
    fechaCompromiso: {
      type: DataTypes.DATEONLY,
      field: 'fecha_compromiso',
      allowNull: true,
      comment: 'Fecha en que el postulante firmó el compromiso',
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
      comment: 'Fecha en que el postulante presentó la solicitud (sección 4), si se desea registrar',
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
    tableName: 'transitabilidades',
  }
);

export default Transitabilidad;

