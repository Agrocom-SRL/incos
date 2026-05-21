import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { AMBITOS_TIPO_EVALUACION_VALUES } from '../../../domain/constants/evaluaciones.constants.js';

export const TipoEvaluacion = sequelize.define(
    'TipoEvaluacion',
    {
        ...baseModelFields,

        codigo: {
            type: DataTypes.STRING(40),
            allowNull: false,
            comment: 'Código del tipo de evaluación.',
        },

        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Nombre descriptivo del tipo.',
        },

        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Descripción del tipo y cuándo se aplica.',
        },

        ambito: {
            type: DataTypes.ENUM(...AMBITOS_TIPO_EVALUACION_VALUES),
            allowNull: true,
            defaultValue: 'BIMESTRE',
            comment: 'BIMESTRE o MATERIA_COMPLETA.',
        },

        esRecuperatorio: {
            type: DataTypes.BOOLEAN,
            field: 'es_recuperatorio',
            allowNull: true,
            defaultValue: false,
            comment: 'TRUE si reemplaza la nota original.',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'tipos_evaluacion',
    }
);

export default TipoEvaluacion;
