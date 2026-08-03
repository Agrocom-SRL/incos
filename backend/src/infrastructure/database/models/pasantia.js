import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  TIPOS_PASANTIA,
  TIPOS_PASANTIA_VALUES,
  ESTADOS_PASANTIA,
  ESTADOS_PASANTIA_VALUES,
  TIPOS_CONTRATO_PASANTIA_VALUES,
  HORAS_PASANTIA_MIN,
} from '../../../domain/constants/pasantias.constants.js';

/**
 * Práctica laboral del estudiante (módulo TUT · pasantías) — tabla raíz
 * `pasantias` (24-pasantias.sql). R.M. 487/2023: 300-360 horas laborales.
 * Dos caminos: PASANTIA (nueva con verificación de empresa) y CONVALIDACION
 * (convalida experiencia laboral existente). Requisito paralelo a la
 * modalidad de graduación, NO una modalidad en sí.
 */
export const Pasantia = sequelize.define(
  'Pasantia',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante pasante (referencia a estudiantes)',
    },
    empresaId: {
      type: DataTypes.INTEGER,
      field: 'empresa_id',
      allowNull: true,
      comment: 'Empresa/institución (referencia a pasantias_empresas)',
    },
    carreraId: {
      type: DataTypes.INTEGER,
      field: 'carrera_id',
      allowNull: true,
      comment: 'Carrera del estudiante (referencia a carreras)',
    },
    gestionId: {
      type: DataTypes.INTEGER,
      field: 'gestion_id',
      allowNull: true,
      comment: 'Gestión académica (referencia a gestiones)',
    },
    docenteSupervisorId: {
      type: DataTypes.INTEGER,
      field: 'docente_supervisor_id',
      allowNull: true,
      comment: 'Docente responsable del seguimiento (referencia a docentes)',
    },
    tipo: {
      type: DataTypes.ENUM(...TIPOS_PASANTIA_VALUES),
      allowNull: true,
      defaultValue: TIPOS_PASANTIA.PASANTIA,
      comment: 'PASANTIA: práctica nueva | CONVALIDACION: convalida experiencia laboral',
    },
    areaDepartamento: {
      type: DataTypes.STRING(150),
      field: 'area_departamento',
      allowNull: true,
      comment: 'Área o departamento asignado (hoja de seguimiento)',
    },
    cargoPuesto: {
      type: DataTypes.STRING(100),
      field: 'cargo_puesto',
      allowNull: true,
      comment: 'Cargo o rol del estudiante',
    },
    funciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Funciones que realiza (convalidación) / actividades previstas (pasantía nueva)',
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      field: 'fecha_inicio',
      allowNull: true,
      comment: 'Fecha de inicio. En CONVALIDACION: fecha desde la cual trabaja',
    },
    fechaFinalizacion: {
      type: DataTypes.DATEONLY,
      field: 'fecha_finalizacion',
      allowNull: true,
      comment: 'Fecha de finalización. NULL en convalidación vigente',
    },
    horasRequeridas: {
      type: DataTypes.SMALLINT.UNSIGNED,
      field: 'horas_requeridas',
      allowNull: true,
      defaultValue: HORAS_PASANTIA_MIN,
      comment: 'Horas laborales requeridas: entre 300 y 360 según R.M. 487/2023',
    },
    horasCumplidas: {
      type: DataTypes.SMALLINT.UNSIGNED,
      field: 'horas_cumplidas',
      allowNull: true,
      defaultValue: 0,
      comment: 'Horas cumplidas a la fecha',
    },
    tipoContrato: {
      type: DataTypes.ENUM(...TIPOS_CONTRATO_PASANTIA_VALUES),
      field: 'tipo_contrato',
      allowNull: true,
      comment: 'Tipo de contrato (solo camino CONVALIDACION; NULL en pasantía nueva)',
    },
    tipoContratoDetalle: {
      type: DataTypes.STRING(100),
      field: 'tipo_contrato_detalle',
      allowNull: true,
      comment: 'Detalle si tipo_contrato = OTRO',
    },
    responsableEmpresa: {
      type: DataTypes.STRING(150),
      field: 'responsable_empresa',
      allowNull: true,
      comment: 'Responsable a cargo del pasante en la empresa (hoja de seguimiento)',
    },
    cargoResponsable: {
      type: DataTypes.STRING(100),
      field: 'cargo_responsable',
      allowNull: true,
      comment: 'Cargo del responsable en la empresa',
    },
    telefonoResponsable: {
      type: DataTypes.STRING(50),
      field: 'telefono_responsable',
      allowNull: true,
      comment: 'Teléfono del responsable en la empresa',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_PASANTIA_VALUES),
      allowNull: true,
      defaultValue: ESTADOS_PASANTIA.SOLICITADA,
      comment: 'Estado del trámite (máquina de estados por camino)',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones generales del trámite',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'pasantias',
  }
);

export default Pasantia;
