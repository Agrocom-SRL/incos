import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const EtapaGestion = sequelize.define(
  'EtapaGestion',
  {
    ...baseModelFields,
    gestionId: {
      type: DataTypes.INTEGER,
      field: 'gestion_id',
      allowNull: true,
      comment: 'Gestión académica',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre de la etapa (ej: Pre-inscripción, Clases, Exámenes)',
    },
    tipo: {
      type: DataTypes.ENUM(
        'PRE_INSCRIPCION',
        'INSCRIPCIONES',
        'CLASES',
        'EVALUACIONES',
        'EXAMENES',
        'ENTREGA_NOTAS',
        'CIERRE_ADMINISTRATIVO',
        'OTRO'
      ),
      allowNull: false,
      comment: 'Tipo de etapa',
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      field: 'fecha_inicio',
      allowNull: false,
      comment: 'Fecha de inicio de la etapa',
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      field: 'fecha_fin',
      allowNull: true,
      comment: 'Fecha de fin de la etapa',
    },
    vigente: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si la etapa está vigente actualmente',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    ...baseModelOptions,
    tableName: 'etapas_gestion',
  }
);

export default EtapaGestion;
