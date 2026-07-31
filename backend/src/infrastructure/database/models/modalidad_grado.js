import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

/**
 * Modalidad de grado (módulo TUT · titulación) — catálogo `modalidades_grado`
 * (22-modalidades-grado.sql). La grupalidad NO es columna: criterio por
 * codigo = MODALIDAD_GRUPAL_CODIGO ('PSP') en titulacion.constants.js.
 */
export const ModalidadGrado = sequelize.define(
  'ModalidadGrado',
  {
    ...baseModelFields,
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Código único de la modalidad (ej: PSP, PG, PE, TD)',
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Nombre completo de la modalidad',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción detallada de la modalidad',
    },
    requiereTutor: {
      type: DataTypes.BOOLEAN,
      field: 'requiere_tutor',
      allowNull: true,
      defaultValue: false,
      comment: 'Si esta modalidad requiere tutor asignado',
    },
    requiereProyecto: {
      type: DataTypes.BOOLEAN,
      field: 'requiere_proyecto',
      allowNull: true,
      defaultValue: false,
      comment: 'Si esta modalidad requiere desarrollo de proyecto',
    },
    requiereDefensa: {
      type: DataTypes.BOOLEAN,
      field: 'requiere_defensa',
      allowNull: true,
      defaultValue: false,
      comment: 'Si esta modalidad requiere defensa final',
    },
    requiereExamen: {
      type: DataTypes.BOOLEAN,
      field: 'requiere_examen',
      allowNull: true,
      defaultValue: false,
      comment: 'Si esta modalidad requiere examen de grado',
    },
    duracionMeses: {
      type: DataTypes.INTEGER,
      field: 'duracion_meses',
      allowNull: true,
      comment: 'Duración estimada en meses',
    },
    cargaHorariaEstimada: {
      type: DataTypes.INTEGER,
      field: 'carga_horaria_estimada',
      allowNull: true,
      comment: 'Carga horaria estimada',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones adicionales',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'modalidades_grado',
  }
);

export default ModalidadGrado;
