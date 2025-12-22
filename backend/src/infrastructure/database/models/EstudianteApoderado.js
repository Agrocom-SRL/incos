import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const EstudianteApoderado = sequelize.define(
  'EstudianteApoderado',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante',
    },
    tipoParentescoId: {
      type: DataTypes.INTEGER,
      field: 'tipo_parentesco_id',
      allowNull: true,
      comment: 'Tipo de parentesco (padre, madre, abuelo, tío, tutor, apoderado, orfanato, etc.)',
    },
    nombres: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Nombres completos del apoderado/tutor',
    },
    apellidos: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Apellidos del apoderado/tutor',
    },
    ci: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Cédula de identidad',
    },
    ocupacion: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Ocupación',
    },
    lugarTrabajo: {
      type: DataTypes.STRING(200),
      field: 'lugar_trabajo',
      allowNull: true,
      comment: 'Lugar de trabajo',
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Dirección de domicilio',
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    celular: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    esContactoEmergencia: {
      type: DataTypes.BOOLEAN,
      field: 'es_contacto_emergencia',
      defaultValue: true,
      comment: 'Es contacto de emergencia',
    },
    esApoderadoLegal: {
      type: DataTypes.BOOLEAN,
      field: 'es_apoderado_legal',
      defaultValue: false,
      comment: 'Es apoderado legal del estudiante',
    },
    viveConEstudiante: {
      type: DataTypes.BOOLEAN,
      field: 'vive_con_estudiante',
      defaultValue: false,
      comment: 'Vive con el estudiante',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    ...baseModelOptions,
    tableName: 'estudiantes_apoderados',
  }
);

export default EstudianteApoderado;
