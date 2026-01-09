import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { GENEROS_VALUES } from '../../../domain/constants/student.constants.js';

export const Personal = sequelize.define(
  'Personal',
  {
    ...baseModelFields,
    usuarioId: {
      type: DataTypes.INTEGER,
      field: 'usuario_id',
      allowNull: true,
      comment: 'Relación con usuario del sistema',
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
      allowNull: true,
    },
    genero: {
      type: DataTypes.ENUM(...GENEROS_VALUES),
      allowNull: true,
    },
    estadoCivilId: {
      type: DataTypes.INTEGER,
      field: 'estado_civil_id',
      allowNull: true,
    },
    emailPersonal: {
      type: DataTypes.STRING(150),
      field: 'email_personal',
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    celular: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    municipioId: {
      type: DataTypes.INTEGER,
      field: 'municipio_id',
      allowNull: true,
    },
  },
  {
    ...baseModelOptions,
    tableName: 'personal',
  }
);

export default Personal;
