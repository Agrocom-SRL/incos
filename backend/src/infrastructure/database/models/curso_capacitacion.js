import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  ESTADOS_CAPACITACION_VALUES,
  ESTADOS_CAPACITACION,
  MODALIDADES_CAPACITACION,
  MODALIDADES_CAPACITACION_VALUES,
} from '../../../domain/constants/capacitacion.constants.js';

/**
 * Curso de capacitación (módulo CAP) — tabla raíz `capacitaciones`.
 * Curso corto abierto a público externo, independiente de la cadena formal
 * paralelos_gestion → oferta_cursos. El curso es conceptual: el aula (opcional)
 * y los horarios viven en sus grupos (`capacitacion_grupos`).
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
    edicion: {
      type: DataTypes.STRING(60),
      allowNull: true,
      comment: 'Etiqueta de la oferta (ej: 2027 – 1ª edición)',
    },
    cursoOrigenId: {
      type: DataTypes.INTEGER,
      field: 'curso_origen_id',
      allowNull: true,
      comment: 'Oferta de la que se copió esta edición',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción/temario del curso',
    },
    tieneCosto: {
      type: DataTypes.BOOLEAN,
      field: 'tiene_costo',
      allowNull: false,
      defaultValue: false,
      comment: 'Interruptor: el curso NO es gratuito (habilita costo)',
    },
    cobraMatricula: {
      type: DataTypes.BOOLEAN,
      field: 'cobra_matricula',
      allowNull: false,
      defaultValue: false,
      comment: 'Interruptor: el curso cobra matrícula (habilita costo_matricula)',
    },
    costo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Costo del CURSO en Bs (se deposita a la entidad certificadora, p. ej. IPELC)',
    },
    costoMatricula: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'costo_matricula',
      allowNull: false,
      defaultValue: 0,
      comment: 'Matrícula en Bs (se paga en secretaría del instituto)',
    },
    entidadCertificadora: {
      type: DataTypes.STRING(150),
      field: 'entidad_certificadora',
      allowNull: true,
      comment: 'Entidad que emite el certificado y cobra el costo del curso (ej: IPELC)',
    },
    modalidad: {
      type: DataTypes.ENUM(...MODALIDADES_CAPACITACION_VALUES),
      allowNull: false,
      defaultValue: MODALIDADES_CAPACITACION.PRESENCIAL,
      comment: 'VIRTUAL | PRESENCIAL | SEMIPRESENCIAL',
    },
    nivel: {
      type: DataTypes.STRING(60),
      allowNull: true,
      comment: 'Nivel del curso (ej: Básico)',
    },
    dirigidoA: {
      type: DataTypes.STRING(255),
      field: 'dirigido_a',
      allowNull: true,
      comment: 'Público objetivo del curso',
    },
    duracion: {
      type: DataTypes.STRING(60),
      allowNull: true,
      comment: 'Duración en texto libre (ej: 2 meses)',
    },
    cupoMaximo: {
      type: DataTypes.INTEGER,
      field: 'cupo_maximo',
      allowNull: false,
      defaultValue: 30,
      comment: 'Cupo máximo de participantes (informativo en el MVP)',
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
      allowNull: true,
      comment: 'Fecha de fin del curso (opcional)',
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
