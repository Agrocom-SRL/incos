import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const EvaluacionFinal = sequelize.define(
    'EvaluacionFinal',
    {
        ...baseModelFields,

        matriculaMateriaId: {
            type: DataTypes.INTEGER,
            field: 'matricula_materia_id',
            allowNull: true,
            comment: 'Matrícula padre (evaluación de materia completa).',
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

        nota: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: 'Nota obtenida (0-100).',
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
            comment: 'Fecha en que se rindió o entregó.',
        },

        notasCerradas: {
            type: DataTypes.BOOLEAN,
            field: 'notas_cerradas',
            allowNull: true,
            defaultValue: false,
            comment: 'TRUE cuando la nota está cerrada.',
        },

        fechaCierreNotas: {
            type: DataTypes.DATEONLY,
            field: 'fecha_cierre_notas',
            allowNull: true,
            comment: 'Fecha de cierre de la nota.',
        },

        cerradasPor: {
            type: DataTypes.INTEGER,
            field: 'cerradas_por',
            allowNull: true,
            comment: 'Usuario que cerró la nota.',
        },

        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Observaciones específicas.',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'evaluaciones_finales',
    }
);

export default EvaluacionFinal;
