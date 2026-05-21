import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const EvaluacionFinalNota = sequelize.define(
    'EvaluacionFinalNota',
    {
        ...baseModelFields,

        evaluacionFinalId: {
            type: DataTypes.INTEGER,
            field: 'evaluacion_final_id',
            allowNull: true,
            comment: 'Evaluación final del curso.',
        },

        matriculaMateriaId: {
            type: DataTypes.INTEGER,
            field: 'matricula_materia_id',
            allowNull: true,
            comment: 'Matrícula del estudiante a la materia.',
        },

        nota: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: 'Nota obtenida (0-100).',
        },

        intento: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
            comment: 'Número de intento.',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'evaluaciones_finales_notas',
    }
);

export default EvaluacionFinalNota;
