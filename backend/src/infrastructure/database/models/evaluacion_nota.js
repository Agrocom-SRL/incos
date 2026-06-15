import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const EvaluacionNota = sequelize.define(
    'EvaluacionNota',
    {
        ...baseModelFields,

        evaluacionId: {
            type: DataTypes.INTEGER,
            field: 'evaluacion_id',
            allowNull: true,
            comment: 'Columna del cuaderno (evaluaciones).',
        },

        bimestreMatriculaId: {
            type: DataTypes.INTEGER,
            field: 'bimestre_matricula_id',
            allowNull: true,
            comment: 'Bimestre operativo del estudiante.',
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
        tableName: 'evaluaciones_notas',
    }
);

export default EvaluacionNota;
