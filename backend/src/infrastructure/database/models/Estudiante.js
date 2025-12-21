import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const Estudiante = sequelize.define(
  'Estudiante',
  {
    ...baseModelFields,
    usuarioId: {
      type: DataTypes.INTEGER,
      field: 'usuario_id',
      allowNull: true,
      comment: 'Relación con usuario del sistema',
    },
    codigoEstudiante: {
      type: DataTypes.STRING(20),
      field: 'codigo_estudiante',
      allowNull: false,
      unique: true,
      comment: 'Código único del estudiante',
    },
    ci: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Cédula de identidad',
    },
    expedicion: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: 'Expedición del CI (SC, LP, CB, etc.)',
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
      comment: 'Fecha de nacimiento',
    },
    genero: {
      type: DataTypes.ENUM('MASCULINO', 'FEMENINO', 'OTRO'),
      allowNull: false,
      comment: 'Género',
    },
    estadoCivilId: {
      type: DataTypes.INTEGER,
      field: 'estado_civil_id',
      allowNull: true,
      comment: 'Estado civil',
    },
    nacionalidad: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Boliviana',
      comment: 'Nacionalidad',
    },
    municipioNacimientoId: {
      type: DataTypes.INTEGER,
      field: 'municipio_nacimiento_id',
      allowNull: true,
      comment: 'Municipio de nacimiento',
    },
    ciudadNacimiento: {
      type: DataTypes.STRING(100),
      field: 'ciudad_nacimiento',
      allowNull: true,
      comment: 'Ciudad de nacimiento',
    },
    idiomaNatalId: {
      type: DataTypes.INTEGER,
      field: 'idioma_natal_id',
      allowNull: true,
      comment: 'Idioma materno',
    },
    tipoSangre: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      field: 'tipo_sangre',
      allowNull: true,
      comment: 'Tipo de sangre',
    },
    tieneDiscapacidad: {
      type: DataTypes.BOOLEAN,
      field: 'tiene_discapacidad',
      allowNull: false,
      defaultValue: false,
      comment: 'Tiene discapacidad',
    },
    tipoDiscapacidadId: {
      type: DataTypes.INTEGER,
      field: 'tipo_discapacidad_id',
      allowNull: true,
      comment: 'Tipo de discapacidad',
    },
    // TODO: Descomentar cuando se confirme la estructura de la base de datos
    // gradoInvalidez: {
    //   type: DataTypes.STRING(50),
    //   field: 'grado_invalidez',
    //   allowNull: true,
    //   comment: 'Grado de invalidez (leve, moderado, severo, profundo)',
    // },
    // detallesDiscapacidad: {
    //   type: DataTypes.TEXT,
    //   field: 'detalles_discapacidad',
    //   allowNull: true,
    //   comment: 'Detalles específicos de la discapacidad',
    // },
    emailPersonal: {
      type: DataTypes.STRING(150),
      field: 'email_personal',
      allowNull: true,
      comment: 'Email personal',
    },
    celular: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Teléfono celular',
    },
    telefonoFijo: {
      type: DataTypes.STRING(20),
      field: 'telefono_fijo',
      allowNull: true,
      comment: 'Teléfono fijo',
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Dirección completa',
    },
    municipioResidenciaId: {
      type: DataTypes.INTEGER,
      field: 'municipio_residencia_id',
      allowNull: true,
      comment: 'Municipio de residencia',
    },
    zona: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Zona/barrio',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones adicionales',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'estudiantes',
    defaultScope: {
      where: {
        activo: true,
      },
    },
  }
);
