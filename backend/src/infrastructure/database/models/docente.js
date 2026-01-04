import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

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
      type: DataTypes.ENUM('MASCULINO', 'FEMENINO', 'OTRO'),
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
      type: DataTypes.ENUM('TECNICO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO'),
      field: 'nivel_academico',
      defaultValue: 'LICENCIATURA',
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
      type: DataTypes.ENUM('PLANTA', 'CONTRATO', 'HORARIO', 'CONSULTOR'),
      field: 'tipo_contrato',
      defaultValue: 'CONTRATO',
    },
    estadoLaboral: {
      type: DataTypes.ENUM('ACTIVO', 'LICENCIA', 'RETIRADO', 'SUSPENDIDO'),
      field: 'estado_laboral',
      defaultValue: 'ACTIVO',
    },
    cargaHorariaSemanal: {
      type: DataTypes.INTEGER,
      field: 'carga_horaria_semanal',
      defaultValue: 0,
    },
    banco: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    numeroCuenta: {
      type: DataTypes.STRING(50),
      field: 'numero_cuenta',
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    ...baseModelOptions,
    tableName: 'docentes',
  }
);

export default Docente;
