import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_BIMESTRE_MATRICULA_VALUES } from '../../../domain/constants/evaluaciones.constants.js';

export const BimestreMatricula = sequelize.define(
    'BimestreMatricula',
    {
        ...baseModelFields,

        matriculaMateriaId: {
            type: DataTypes.INTEGER,
            field: 'matricula_materia_id',
            allowNull: true,
            comment: 'Matrícula padre.',
        },

        bimestre: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Número de bimestre (1-4).',
        },

        notaTeorico: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'nota_teorico',
            allowNull: true,
            comment: 'Nota del componente teórico.',
        },

        notaPractico: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'nota_practico',
            allowNull: true,
            comment: 'Nota del componente práctico.',
        },

        notaBimestre: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'nota_bimestre',
            allowNull: true,
            comment: 'Nota cerrada del bimestre (teórico + práctico).',
        },

        pesoBimestre: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'peso_bimestre',
            allowNull: true,
            defaultValue: 1,
            comment: 'Peso del bimestre en la nota final.',
        },

        notaHabilitacion: {
            type: DataTypes.VIRTUAL,
            get() {
                const teo = this.getDataValue('habilitacionTeorico');
                const pra = this.getDataValue('habilitacionPractico');
                if (teo == null && pra == null) return null;
                return (Number(teo) || 0) + (Number(pra) || 0);
            },
            comment: 'Compatibilidad: suma de habilitaciones por componente.',
        },

        habilitacionTeorico: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'habilitacion_teorico',
            allowNull: true,
            comment: 'Puntos de habilitación teórica.',
        },

        habilitacionPractico: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'habilitacion_practico',
            allowNull: true,
            comment: 'Puntos de habilitación práctica.',
        },

        fechaHabilitacion: {
            type: DataTypes.DATEONLY,
            field: 'fecha_habilitacion',
            allowNull: true,
            comment: 'Fecha del primer acto administrativo de habilitación.',
        },

        estado: {
            type: DataTypes.ENUM(...ESTADOS_BIMESTRE_MATRICULA_VALUES),
            allowNull: true,
            defaultValue: 'PENDIENTE',
            comment: 'PENDIENTE, EN_CURSO o CERRADO.',
        },

        fechaCierre: {
            type: DataTypes.DATEONLY,
            field: 'fecha_cierre',
            allowNull: true,
            comment: 'Fecha de cierre del bimestre.',
        },

        cerradoPor: {
            type: DataTypes.INTEGER,
            field: 'cerrado_por',
            allowNull: true,
            comment: 'Usuario que cerró el bimestre.',
        },

        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Observaciones del bimestre.',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'bimestres_matricula',
    }
);

export default BimestreMatricula;
