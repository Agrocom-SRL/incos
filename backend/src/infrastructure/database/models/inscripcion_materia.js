import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_MATERIA_INSCRITA_VALUES, ESTADOS_MATERIA_INSCRITA } from '../../../domain/constants/inscripciones.constants.js';

export const InscripcionMateria = sequelize.define(
  'InscripcionMateria',
  {
    ...baseModelFields,
    inscripcionId: {
      type: DataTypes.INTEGER,
      field: 'inscripcion_id',
      allowNull: true,
      comment: 'Inscripción del estudiante (referencia a inscripciones)',
    },
    asignacionDocenteId: {
      type: DataTypes.INTEGER,
      field: 'asignacion_docente_id',
      allowNull: true,
      comment: 'Asignación docente específica (curso + docente + gestion_plan) a la que se inscribe. Garantiza que el curso esté activo en la gestión y tenga docente asignado.',
    },
    notaFinal: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'nota_final',
      allowNull: true,
      comment: 'Nota final (promedio de parciales y práctico, calculado desde calificaciones)',
    },
    notaDefinitiva: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'nota_definitiva',
      allowNull: true,
      comment: 'Nota definitiva (considera recuperatorio si aprobó >=60, calculado desde calificaciones)',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_MATERIA_INSCRITA_VALUES),
      allowNull: false,
      defaultValue: ESTADOS_MATERIA_INSCRITA.INSCRITO,
      comment: 'Estado de la materia individual (se actualiza automáticamente según nota_definitiva). Diferente de tipo_inscripcion que está en la tabla inscripciones.',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones generales',
    },
    observacionesDocente: {
      type: DataTypes.TEXT,
      field: 'observaciones_docente',
      allowNull: true,
      comment: 'Observaciones del docente',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'inscripciones_materias',
  }
);

export default InscripcionMateria;
