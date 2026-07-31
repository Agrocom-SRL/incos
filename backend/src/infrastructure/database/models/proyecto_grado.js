import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  ESTADOS_PROYECTO_GRADO,
  ESTADOS_PROYECTO_GRADO_VALUES,
} from '../../../domain/constants/titulacion.constants.js';

/**
 * Proyecto de grado (módulo TUT · titulación) — tabla raíz `proyectos_grado`
 * (22-modalidades-grado.sql). NO se duplica: los satélites del schema 23
 * (integrantes_proyecto, avances_proyecto, bitacora_proyecto, dictamenes_proyecto)
 * cuelgan de esta raíz.
 *
 * `estudiante_id` queda LEGACY: titular en proyectos individuales, NULL en
 * grupales; los consumidores nuevos leen integrantes_proyecto.
 */
export const ProyectoGrado = sequelize.define(
  'ProyectoGrado',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'LEGACY: titular en proyectos individuales; NULL en grupales (usar integrantes_proyecto)',
    },
    modalidadId: {
      type: DataTypes.INTEGER,
      field: 'modalidad_id',
      allowNull: true,
      comment: 'Modalidad de grado elegida (referencia a modalidades_grado)',
    },
    tutorId: {
      type: DataTypes.INTEGER,
      field: 'tutor_id',
      allowNull: true,
      comment: 'Tutor asignado (referencia a docentes)',
    },
    carreraId: {
      type: DataTypes.INTEGER,
      field: 'carrera_id',
      allowNull: true,
      comment: 'Carrera del proyecto (referencia a carreras)',
    },
    gestionId: {
      type: DataTypes.INTEGER,
      field: 'gestion_id',
      allowNull: true,
      comment: 'Gestión académica (referencia a gestiones)',
    },
    titulo: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Título del proyecto/trabajo/tesis',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción del proyecto',
    },
    objetivos: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Objetivos del proyecto',
    },
    alcance: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Alcance del proyecto',
    },
    metodologia: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Metodología a utilizar',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_PROYECTO_GRADO_VALUES),
      allowNull: true,
      defaultValue: ESTADOS_PROYECTO_GRADO.PERFIL,
      comment: 'Estado actual del proyecto (máquina de estados de titulación)',
    },
    fechaPresentacionPerfil: {
      type: DataTypes.DATEONLY,
      field: 'fecha_presentacion_perfil',
      allowNull: true,
    },
    fechaAprobacionPerfil: {
      type: DataTypes.DATEONLY,
      field: 'fecha_aprobacion_perfil',
      allowNull: true,
    },
    fechaInicioDesarrollo: {
      type: DataTypes.DATEONLY,
      field: 'fecha_inicio_desarrollo',
      allowNull: true,
    },
    fechaPresentacionPredefensa: {
      type: DataTypes.DATEONLY,
      field: 'fecha_presentacion_predefensa',
      allowNull: true,
    },
    fechaAprobacionPredefensa: {
      type: DataTypes.DATEONLY,
      field: 'fecha_aprobacion_predefensa',
      allowNull: true,
    },
    fechaDefensa: {
      type: DataTypes.DATEONLY,
      field: 'fecha_defensa',
      allowNull: true,
    },
    fechaAprobacion: {
      type: DataTypes.DATEONLY,
      field: 'fecha_aprobacion',
      allowNull: true,
    },
    notaPerfil: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'nota_perfil',
      allowNull: true,
    },
    notaPredefensa: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'nota_predefensa',
      allowNull: true,
    },
    notaDefensa: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'nota_defensa',
      allowNull: true,
    },
    notaFinal: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'nota_final',
      allowNull: true,
    },
    documentoPerfilId: {
      type: DataTypes.INTEGER,
      field: 'documento_perfil_id',
      allowNull: true,
    },
    documentoProyectoId: {
      type: DataTypes.INTEGER,
      field: 'documento_proyecto_id',
      allowNull: true,
    },
    documentoPredefensaId: {
      type: DataTypes.INTEGER,
      field: 'documento_predefensa_id',
      allowNull: true,
    },
    documentoDefensaId: {
      type: DataTypes.INTEGER,
      field: 'documento_defensa_id',
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones generales',
    },
    observacionesTutor: {
      type: DataTypes.TEXT,
      field: 'observaciones_tutor',
      allowNull: true,
      comment: 'Observaciones del tutor',
    },
    observacionesComite: {
      type: DataTypes.TEXT,
      field: 'observaciones_comite',
      allowNull: true,
      comment: 'Observaciones del comité evaluador',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'proyectos_grado',
  }
);

export default ProyectoGrado;
