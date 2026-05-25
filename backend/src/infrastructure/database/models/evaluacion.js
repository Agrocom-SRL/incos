import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { COMPONENTES_EVALUACION_VALUES } from '../../../domain/constants/evaluaciones.constants.js';

export const Evaluacion = sequelize.define(
    'Evaluacion',
    {
        ...baseModelFields,

        asignacionDocenteId: {
            type: DataTypes.INTEGER,
            field: 'asignacion_docente_id',
            allowNull: true,
            comment: 'Curso al que pertenece esta columna del cuaderno.',
        },

        periodoAcademicoId: {
            type: DataTypes.INTEGER,
            field: 'periodo_academico_id',
            allowNull: true,
            comment: 'Bimestre del calendario (periodos_academicos con division=BIMESTRE).',
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
            type: DataTypes.STRING(255),
            field: 'nombre_evaluacion',
            allowNull: true,
            comment: 'Nombre descriptivo de la evaluación.',
        },

        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Descripción o consigna.',
        },

        puntos: {
            type: DataTypes.SMALLINT.UNSIGNED,
            allowNull: true,
            defaultValue: 1,
            comment: 'Puntos máximos de la actividad (entero). La celda admite 0..puntos.',
        },

        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'Fecha en que se rindió.',
        },

        notasCerradas: {
            type: DataTypes.BOOLEAN,
            field: 'notas_cerradas',
            allowNull: true,
            defaultValue: false,
            comment: 'TRUE cuando las notas de esta columna están cerradas.',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'evaluaciones',
    }
);

export default Evaluacion;
