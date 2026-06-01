import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { GENEROS_VALUES } from '../../../domain/constants/estudiantes.constants.js';
import { NIVELES_ACADEMICOS, NIVELES_ACADEMICOS_PERSONAL_VALUES, ESTADOS_LABORALES } from '../../../domain/constants/docentes.constants.js';
import { TIPOS_CONTRATO_DOCENTE_VALUES, TIPOS_CONTRATO_DOCENTE, ESTADOS_LABORALES_VALUES } from '../../../domain/constants/docentes.constants.js';

export const Docente = sequelize.define(
  'Docente',
  {
    ...baseModelFields,
    usuarioId: {
      type: DataTypes.INTEGER,
      field: 'usuario_id',
      allowNull: true,
      comment: 'Relación con usuario del sistema',
    },
    ci: {
      type: DataTypes.STRING(25),
      allowNull: false,
      comment: 'Cédula de identidad',
    },
    expedicion: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: 'Expedición del CI',
    },
    nombres: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Nombres completos',
    },
    apellidoPaterno: {
      type: DataTypes.STRING(100),
      field: 'apellido_paterno',
      allowNull: false,
      comment: 'Apellido paterno',
    },
    apellidoMaterno: {
      type: DataTypes.STRING(100),
      field: 'apellido_materno',
      allowNull: true,
      comment: 'Apellido materno',
    },
    fechaNacimiento: {
      type: DataTypes.DATEONLY,
      field: 'fecha_nacimiento',
      allowNull: false,
    },
    genero: {
      type: DataTypes.ENUM(...GENEROS_VALUES),
      allowNull: false,
    },
    estadoCivilId: {
      type: DataTypes.INTEGER,
      field: 'estado_civil_id',
      allowNull: true,
    },
    nacionalidad: {
      type: DataTypes.STRING(50),
      defaultValue: 'Boliviana',
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    celular: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    emailPersonal: {
      type: DataTypes.STRING(150),
      field: 'email_personal',
      allowNull: true,
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    municipioResidenciaId: {
      type: DataTypes.INTEGER,
      field: 'municipio_residencia_id',
      allowNull: true,
    },
    zona: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tituloProfesional: {
      type: DataTypes.STRING(200),
      field: 'titulo_profesional',
      allowNull: true,
    },
    especialidad: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    nivelAcademico: {
      type: DataTypes.ENUM(...NIVELES_ACADEMICOS_PERSONAL_VALUES),
      field: 'nivel_academico',
      defaultValue: NIVELES_ACADEMICOS.LICENCIATURA,
    },
    institucionEgreso: {
      type: DataTypes.STRING(200),
      field: 'institucion_egreso',
      allowNull: true,
    },
    anioEgreso: {
      type: DataTypes.INTEGER,
      field: 'anio_egreso',
      allowNull: true,
    },
    aniosExperiencia: {
      type: DataTypes.INTEGER,
      field: 'anios_experiencia',
      defaultValue: 0,
    },
    fechaContratacion: {
      type: DataTypes.DATEONLY,
      field: 'fecha_contratacion',
      allowNull: true,
    },
    fechaRetiro: {
      type: DataTypes.DATEONLY,
      field: 'fecha_retiro',
      allowNull: true,
    },
    tipoContrato: {
      type: DataTypes.ENUM(...TIPOS_CONTRATO_DOCENTE_VALUES),
      field: 'tipo_contrato',
      defaultValue: TIPOS_CONTRATO_DOCENTE.CONTRATO,
    },
    estadoLaboral: {
      type: DataTypes.ENUM(...ESTADOS_LABORALES_VALUES),
      field: 'estado_laboral',
      defaultValue: ESTADOS_LABORALES.ACTIVO,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    colorHex: {
      type: DataTypes.STRING(7),
      field: 'color_hex',
      allowNull: true,
      comment: 'Color exclusivo del docente para visualización en horarios.',
    },
    maxHorasSemana: {
      type: DataTypes.INTEGER,
      field: 'max_horas_semana',
      allowNull: true,
      defaultValue: 20,
      comment: 'Carga máxima semanal según contrato.',
    },
    maxHorasMes: {
      type: DataTypes.INTEGER,
      field: 'max_horas_mes',
      allowNull: true,
      defaultValue: 80,
      comment: 'Carga máxima mensual según contrato.',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'docentes',
  }
);

export default Docente;
