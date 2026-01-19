import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { GENEROS_VALUES } from '../../../domain/constants/student.constants.js';
import { TIPOS_SANGRE_VALUES } from '../../../domain/constants/student.constants.js';

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
      comment: 'Código único del estudiante',
    },
    ci: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Cédula de identidad',
    },
    expedicion: {
      type: DataTypes.STRING(5),
      allowNull: true, // Expedición es opcional
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
      allowNull: true, // Apellido paterno es opcional
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
      type: DataTypes.ENUM(...GENEROS_VALUES),
      allowNull: false,
      comment: 'Género',
    },
    estadoCivilId: {
      type: DataTypes.INTEGER,
      field: 'estado_civil_id',
      allowNull: true,
      comment: 'Estado civil',
    },
    tipoSangre: {
      type: DataTypes.ENUM(...TIPOS_SANGRE_VALUES),
      field: 'tipo_sangre',
      allowNull: true,
      comment: 'Tipo de sangre',
    },
    tieneDiscapacidad: {
      type: DataTypes.BOOLEAN,
      field: 'tiene_discapacidad',
      allowNull: false,
      defaultValue: false,
      comment: 'Tiene discapacidad (los detalles están en estudiantes_discapacidades)',
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
