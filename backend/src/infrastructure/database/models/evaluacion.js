import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { COMPONENTES_EVALUACION_VALUES } from '../../../domain/constants/evaluaciones.constants.js';

export const Evaluacion = sequelize.define(
    'Evaluacion',
    {
        ...baseModelFields,

        bimestreMatriculaId: {
            type: DataTypes.INTEGER,
            field: 'bimestre_matricula_id',
            allowNull: true,
            comment: 'Bimestre al que pertenece.',
        },

        tipoEvaluacionId: {
            type: DataTypes.INTEGER,
            field: 'tipo_evaluacion_id',
            allowNull: true,
            comment: 'Tipo de evaluación (ámbito BIMESTRE).',
        },

        componente: {
            type: DataTypes.ENUM(...COMPONENTES_EVALUACION_VALUES),
            allowNull: false,
            defaultValue: 'PRACTICO',
            comment: 'TEORICO o PRACTICO.',
        },

        nombreEvaluacion: {
            type: DataTypes.STRING(200),
            field: 'nombre_evaluacion',
            allowNull: true,
            comment: 'Nombre descriptivo de la evaluación.',
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
            comment: 'Peso dentro de su componente en el bimestre.',
        },

        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'Fecha en que se rindió.',
        },

        intento: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
            comment: 'Número de intento.',
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
        tableName: 'evaluaciones',
    }
);

export default Evaluacion;
