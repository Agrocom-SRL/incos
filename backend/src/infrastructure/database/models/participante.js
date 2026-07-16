import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

/**
 * Participante de cursos de capacitación (módulo CAP).
 * Persona externa a la matrícula formal: SIN FK a estudiantes/usuarios,
 * sin acceso al sistema. Unicidad de negocio CI+expedición (sin UNIQUE en BD).
 */
export const Participante = sequelize.define(
  'Participante',
  {
    ...baseModelFields,
    ci: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Cédula de identidad',
    },
    expedicion: {
      type: DataTypes.STRING(5),
      allowNull: true,
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
      allowNull: true,
      comment: 'Apellido paterno',
    },
    apellidoMaterno: {
      type: DataTypes.STRING(100),
      field: 'apellido_materno',
      allowNull: true,
      comment: 'Apellido materno',
    },
    celular: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Teléfono celular de contacto',
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Correo de contacto (opcional)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'participantes',
  }
);

export default Participante;
