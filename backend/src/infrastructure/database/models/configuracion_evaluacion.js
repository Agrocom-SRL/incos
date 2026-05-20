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
            comment: 'Gestión a la que aplica la configuración.',
        },

        clave: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Clave de configuración (ej: POLITICA_INSTITUCIONAL).',
        },

        valor: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: 'Valor serializado (JSON para política institucional).',
        },

        tipo: {
            type: DataTypes.ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE'),
            allowNull: false,
            defaultValue: 'JSON',
            comment: 'Tipo de dato del valor.',
        },

        vigente: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'TRUE = configuración activa para la gestión y clave.',
        },

        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Descripción legible de la configuración.',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'configuracion_evaluacion',
    }
);

export default ConfiguracionEvaluacion;
