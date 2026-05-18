import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const ConfiguracionEvaluacion = sequelize.define(
    'ConfiguracionEvaluacion',
    {
        ...baseModelFields,

        gestionId: {
            type: DataTypes.INTEGER,
            field: 'gestion_id',
            allowNull: true,
            comment: 'Gestión a la que aplica la configuración teórico/práctico.',
        },

        cuotaTeorico: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'cuota_teorico',
            allowNull: false,
            defaultValue: 30,
            comment: 'Cuota del componente teórico sobre 100 puntos.',
        },

        cuotaPractico: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'cuota_practico',
            allowNull: false,
            defaultValue: 70,
            comment: 'Cuota del componente práctico sobre 100 puntos.',
        },

        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Descripción o motivo del cambio de configuración.',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'configuracion_evaluacion',
    }
);

export default ConfiguracionEvaluacion;
