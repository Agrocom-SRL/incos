import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { TIPOS_INSCRIPCION_VALUES, TIPOS_INSCRIPCION } from '../../../domain/constants/inscripciones.constants.js';

export const Inscripcion = sequelize.define(
  'Inscripcion',
  {
    ...baseModelFields,
    estudianteDatosAcademicosId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_datos_academicos_id',
      allowNull: true,
      comment: 'Datos académicos del estudiante (referencia a estudiantes_datos_academicos). Contiene la carrera del estudiante y su gestión de ingreso.',
    },
    gestionId: {
      type: DataTypes.INTEGER,
      field: 'gestion_id',
      allowNull: true,
      comment: 'Gestión académica (año lectivo) en la que se inscribe (referencia a gestiones). Diferente de gestion_ingreso_id en estudiantes_datos_academicos.',
    },
    tipoInscripcion: {
      type: DataTypes.ENUM(...TIPOS_INSCRIPCION_VALUES),
      field: 'tipo_inscripcion',
      allowNull: false,
      defaultValue: TIPOS_INSCRIPCION.CONTINUIDAD,
      comment: 'Tipo de inscripción: NUEVO (primera vez, se inscribe por bloques - todas las materias del periodo 1), REINGRESO (regresa después de ausencia), CONTINUIDAD (continúa de gestión anterior, puede elegir materias individuales), TRANSFERENCIA_ENTRADA (viene de otra institución), TRASPASO_ENTRADA (viene de otra sede)',
    },
    fechaInscripcion: {
      type: DataTypes.DATEONLY,
      field: 'fecha_inscripcion',
      allowNull: true,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha en que se realizó la inscripción',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones generales sobre la inscripción',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'inscripciones',
  }
);

export default Inscripcion;
