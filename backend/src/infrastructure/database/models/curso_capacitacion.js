import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_CAPACITACION_VALUES, ESTADOS_CAPACITACION } from '../../../domain/constants/capacitacion.constants.js';

/**
 * Curso de capacitación (módulo CAP) — tabla raíz `capacitaciones`.
 * Curso corto abierto a público externo, independiente de la cadena formal
 * paralelos_gestion → oferta_cursos. El aula se referencia por FK de lectura
 * al catálogo `aulas` (igual que paralelos_gestion.aula_id).
 */
export const CursoCapacitacion = sequelize.define(
  'CursoCapacitacion',
  {
    ...baseModelFields,
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Título del curso (ej: Word avanzado)',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción/temario del curso',
    },
    costo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Costo de matrícula/inscripción en Bs',
    },
    cupoMaximo: {
      type: DataTypes.INTEGER,
      field: 'cupo_maximo',
      allowNull: false,
      defaultValue: 30,
      comment: 'Cupo máximo de participantes (informativo en el MVP)',
    },
    aulaId: {
      type: DataTypes.INTEGER,
      field: 'aula_id',
      allowNull: true,
      comment: 'Aula asignada (catálogo aulas, reutilizado)',
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      field: 'fecha_inicio',
      allowNull: false,
      comment: 'Fecha de inicio del curso',
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      field: 'fecha_fin',
      allowNull: false,
      comment: 'Fecha de fin del curso',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_CAPACITACION_VALUES),
      allowNull: false,
      defaultValue: ESTADOS_CAPACITACION.PROPUESTO,
      comment:
        'PROPUESTO: en definición | ABIERTO: acepta inscripciones | EN_CURSO: iniciado | CERRADO: finalizado | CANCELADO',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'capacitaciones',
  }
);

export default CursoCapacitacion;
