import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
    MOTIVOS_LICENCIAS_VALUES,
    ESTADOS_LICENCIAS_VALUES,
    ESTADOS_LICENCIAS,
} from '../../../domain/constants/licencias.constants.js';

export const Licencia = sequelize.define(
    'Licencia',
    {
        ...baseModelFields,

        inscripcionId: {
            type: DataTypes.INTEGER,
            field: 'inscripcion_id',
            allowNull: true,
            comment:
                'Inscripción a la que aplica. Estudiante y gestión derivables vía inscripcion.',
        },

        fechaSolicitud: {
            type: DataTypes.DATEONLY,
            field: 'fecha_solicitud',
            allowNull: false,
            comment: 'Fecha en que se presentó la solicitud',
        },

        fechaInicio: {
            type: DataTypes.DATEONLY,
            field: 'fecha_inicio',
            allowNull: false,
            comment: 'Fecha de inicio del periodo de licencia',
        },

        fechaFin: {
            type: DataTypes.DATEONLY,
            field: 'fecha_fin',
            allowNull: false,
            comment: 'Fecha de fin del periodo de licencia',
        },

        totalDias: {
            type: DataTypes.INTEGER,
            field: 'total_dias',
            allowNull: true,
            comment: 'Total de días de licencia (calculado o ingresado)',
        },

        motivo: {
            type: DataTypes.ENUM(...MOTIVOS_LICENCIAS_VALUES),
            allowNull: false,
            defaultValue: 'OTRO',
            comment: 'Motivo según formulario INCOS',
        },

        detalleMotivo: {
            type: DataTypes.TEXT,
            field: 'detalle_motivo',
            allowNull: false,
            comment: 'Detalle del motivo (observaciones)',
        },

        estado: {
            type: DataTypes.ENUM(...ESTADOS_LICENCIAS_VALUES),
            allowNull: true,
            defaultValue: ESTADOS_LICENCIAS.PENDIENTE,
            comment:
                'PENDIENTE, APROBADA (neutraliza ausencias en el rango), RECHAZADA, CANCELADA',
        },

        observacionesDecision: {
            type: DataTypes.TEXT,
            field: 'observaciones_decision',
            allowNull: true,
            comment: 'Observación única de la decisión (motivo de aprobación/rechazo/cancelación)',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'licencias',
    }
);

export default Licencia;
