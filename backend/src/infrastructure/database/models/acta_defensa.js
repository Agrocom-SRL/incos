import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  RESULTADOS_ACTA_DEFENSA_VALUES,
  ESTADOS_ACTA_DEFENSA,
  ESTADOS_ACTA_DEFENSA_VALUES,
} from '../../../domain/constants/titulacion.constants.js';

/**
 * Acta de defensa de grado (módulo TIT · titulación) — tabla `actas_defensa`
 * (22-modalidades-grado.sql, extensión 2026-08-01). UNA por estudiante
 * integrante: en PSP grupal hay N actas del mismo proyecto. El resumen
 * académico (fecha_defensa, nota_defensa, nota_final, estado) sigue
 * viviendo en `proyectos_grado` — el use case de registro lo sincroniza
 * delegando en `AprobarEtapaProyectoUseCase` (T11), no se duplica aquí.
 */
export const ActaDefensa = sequelize.define(
  'ActaDefensa',
  {
    ...baseModelFields,
    proyectoGradoId: {
      type: DataTypes.INTEGER,
      field: 'proyecto_grado_id',
      allowNull: true,
      comment: 'Proyecto de grado defendido (referencia a proyectos_grado)',
    },
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante que defiende (referencia a estudiantes)',
    },
    gestionId: {
      type: DataTypes.INTEGER,
      field: 'gestion_id',
      allowNull: true,
      comment: 'Gestión del acta (ancla de la serie correlativa)',
    },
    numeroActa: {
      type: DataTypes.INTEGER,
      field: 'numero_acta',
      allowNull: false,
      comment: 'Número correlativo del acta dentro de la gestión (foliado rojo del talonario)',
    },
    fechaDefensa: {
      type: DataTypes.DATEONLY,
      field: 'fecha_defensa',
      allowNull: false,
    },
    horaInicio: {
      type: DataTypes.TIME,
      field: 'hora_inicio',
      allowNull: false,
    },
    horaConclusion: {
      type: DataTypes.TIME,
      field: 'hora_conclusion',
      allowNull: true,
    },
    calificacionFinal: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'calificacion_final',
      allowNull: false,
    },
    resultado: {
      type: DataTypes.ENUM(...RESULTADOS_ACTA_DEFENSA_VALUES),
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_ACTA_DEFENSA_VALUES),
      allowNull: true,
      defaultValue: ESTADOS_ACTA_DEFENSA.EMITIDA,
      comment: 'EMITIDA: vigente | ANULADA: dejada sin efecto (flujo de anular no implementado en v1)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'actas_defensa',
  }
);

export default ActaDefensa;
