import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  ROLES_INTEGRANTE_TUTORIA,
  ROLES_INTEGRANTE_TUTORIA_VALUES,
  ESTADOS_INTEGRANTE_TUTORIA,
  ESTADOS_INTEGRANTE_TUTORIA_VALUES,
} from '../../../domain/constants/tutorias.constants.js';

/**
 * Integrante de proyecto de grado (módulo TUT) — tabla `integrantes_proyecto`.
 * 1..N estudiantes por proyecto; habilita proyectos grupales (PSP) sobre
 * proyectos_grado sin duplicar la raíz.
 */
export const IntegranteProyecto = sequelize.define(
  'IntegranteProyecto',
  {
    ...baseModelFields,
    proyectoGradoId: {
      type: DataTypes.INTEGER,
      field: 'proyecto_grado_id',
      allowNull: true,
      comment: 'Proyecto de grado (referencia a proyectos_grado)',
    },
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante integrante (referencia a estudiantes)',
    },
    rol: {
      type: DataTypes.ENUM(...ROLES_INTEGRANTE_TUTORIA_VALUES),
      allowNull: true,
      defaultValue: ROLES_INTEGRANTE_TUTORIA.INTEGRANTE,
      comment: 'TITULAR: responsable/contacto | INTEGRANTE: miembro del grupo',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_INTEGRANTE_TUTORIA_VALUES),
      allowNull: true,
      defaultValue: ESTADOS_INTEGRANTE_TUTORIA.ACTIVO,
      comment: 'ACTIVO en el proyecto o RETIRADO',
    },
    fechaIncorporacion: {
      type: DataTypes.DATEONLY,
      field: 'fecha_incorporacion',
      allowNull: true,
      comment: 'Fecha en que se incorporó al proyecto',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones del integrante',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'integrantes_proyecto',
  }
);

export default IntegranteProyecto;
