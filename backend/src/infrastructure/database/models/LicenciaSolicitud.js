import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const LicenciaSolicitud = sequelize.define(
  'LicenciaSolicitud',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante solicitante',
    },
    carreraId: {
      type: DataTypes.INTEGER,
      field: 'carrera_id',
      allowNull: true,
      comment: 'Carrera',
    },
    gestionId: {
      type: DataTypes.INTEGER,
      field: 'gestion_id',
      allowNull: true,
      comment: 'Gestión',
    },
    turnoCursoId: {
      type: DataTypes.INTEGER,
      field: 'turno_curso_id',
      allowNull: true,
      comment: 'Turno/curso paralelo donde está matriculado',
    },
    fechaSolicitud: {
      type: DataTypes.DATEONLY,
      field: 'fecha_solicitud',
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha de solicitud',
    },
    fechaDesde: {
      type: DataTypes.DATEONLY,
      field: 'fecha_desde',
      allowNull: false,
      comment: 'Inicio de la licencia (Desde)',
    },
    fechaHasta: {
      type: DataTypes.DATEONLY,
      field: 'fecha_hasta',
      allowNull: false,
      comment: 'Fin de la licencia (Hasta)',
    },
    totalDias: {
      type: DataTypes.INTEGER,
      field: 'total_dias',
      allowNull: false,
      comment: 'Total de días',
    },
    motivo: {
      type: DataTypes.ENUM('ENFERMEDAD', 'TRABAJO', 'FAMILIAR', 'VIAJE', 'ACADEMICO', 'DEPORTIVO', 'PERSONAL', 'OTRO'),
      allowNull: false,
      comment: 'Motivo de la licencia',
    },
    detalleMotivo: {
      type: DataTypes.TEXT,
      field: 'detalle_motivo',
      allowNull: false,
      comment: 'Detalle del motivo (observaciones)',
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA'),
      defaultValue: 'PENDIENTE',
      comment: 'Estado de la solicitud',
    },
    fechaDecision: {
      type: DataTypes.DATEONLY,
      field: 'fecha_decision',
      allowNull: true,
    },
    decididoPor: {
      type: DataTypes.INTEGER,
      field: 'decidido_por',
      allowNull: true,
      comment: 'Usuario que decidió (Director Académico)',
    },
    motivoRechazo: {
      type: DataTypes.TEXT,
      field: 'motivo_rechazo',
      allowNull: true,
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
    observacionesDecision: {
      type: DataTypes.TEXT,
      field: 'observaciones_decision',
      allowNull: true,
      comment: 'Observaciones del decisor',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'licencias_solicitudes',
  }
);

export default LicenciaSolicitud;
