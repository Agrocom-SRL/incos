import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const EvaluacionFinal = sequelize.define(
    'EvaluacionFinal',
    {
        ...baseModelFields,

        asignacionDocenteId: {
            type: DataTypes.INTEGER,
            field: 'asignacion_docente_id',
            allowNull: true,
            comment: 'Curso al que pertenece esta evaluación final.',
        },

        tipoEvaluacionId: {
            type: DataTypes.INTEGER,
            field: 'tipo_evaluacion_id',
            allowNull: true,
            comment: 'Tipo de evaluación (ámbito MATERIA_COMPLETA).',
        },

        nombreEvaluacion: {
            type: DataTypes.STRING(200),
            field: 'nombre_evaluacion',
            allowNull: true,
            comment: 'Nombre descriptivo.',
        },

        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Descripción o consigna.',
        },

        peso: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            defaultValue: 1,
            comment: 'Peso en el cálculo de nota_final.',
        },

        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'Fecha en que se rinde o entrega.',
        },

        notasCerradas: {
            type: DataTypes.BOOLEAN,
            field: 'notas_cerradas',
            allowNull: true,
            defaultValue: false,
            comment: 'TRUE cuando las notas de esta evaluación final están cerradas.',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'evaluaciones_finales',
    }
);

export default EvaluacionFinal;
