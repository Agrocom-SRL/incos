import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const EstudianteBeca = sequelize.define(
  'EstudianteBeca',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante beneficiario',
    },
    becaDescuentoId: {
      type: DataTypes.INTEGER,
      field: 'beca_descuento_id',
      allowNull: true,
      comment: 'Tipo de beca/descuento sobre el aporte anual de matrícula (400 bs)',
    },
    gestionId: {
      type: DataTypes.INTEGER,
      field: 'gestion_id',
      allowNull: true,
      comment: 'Gestión',
    },
    fechaSolicitud: {
      type: DataTypes.DATEONLY,
      field: 'fecha_solicitud',
      allowNull: false,
      comment: 'Fecha en que se solicitó el descuento',
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'ACTIVA', 'FINALIZADA', 'RECHAZADA'),
      defaultValue: 'PENDIENTE',
      comment: 'Estado de la beca',
    },
    documentosCompletos: {
      type: DataTypes.BOOLEAN,
      field: 'documentos_completos',
      defaultValue: false,
      comment: 'Documentación completa',
    },
    fechaInicioEntregaDocumentos: {
      type: DataTypes.DATEONLY,
      field: 'fecha_inicio_entrega_documentos',
      allowNull: true,
    },
    fechaFinEntregaDocumentos: {
      type: DataTypes.DATEONLY,
      field: 'fecha_fin_entrega_documentos',
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    ...baseModelOptions,
    tableName: 'estudiantes_becas',
  }
);

export default EstudianteBeca;
