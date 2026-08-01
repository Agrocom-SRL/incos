import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { CARGO_TRIBUNAL_ACTA_DEFENSA_DEFAULT } from '../../../domain/constants/titulacion.constants.js';

/**
 * Miembro del Tribunal Evaluador de un acta de defensa (módulo TIT ·
 * titulación) — tabla `tribunal_acta_defensa` (22-modalidades-grado.sql,
 * extensión 2026-08-01). Siempre docentes del instituto (P5: sin
 * profesionales externos) — exigido en el use case/validador de CREAR, no
 * como NOT NULL de BD: `docenteId` es NULLable únicamente para sobrevivir a
 * `ON DELETE SET NULL` (convención 100% del repo). `nombreCompleto` es un
 * snapshot para fidelidad con el documento firmado.
 */
export const TribunalActaDefensa = sequelize.define(
  'TribunalActaDefensa',
  {
    ...baseModelFields,
    actaDefensaId: {
      type: DataTypes.INTEGER,
      field: 'acta_defensa_id',
      allowNull: true,
      comment: 'Acta a la que pertenece el miembro (referencia a actas_defensa)',
    },
    orden: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: 'Posición 1..3 en la lista y en las firmas',
    },
    docenteId: {
      type: DataTypes.INTEGER,
      field: 'docente_id',
      allowNull: true,
      comment: 'Docente del instituto (referencia a docentes)',
    },
    nombreCompleto: {
      type: DataTypes.STRING(200),
      field: 'nombre_completo',
      allowNull: false,
      comment: 'Nombre como se imprime en el acta (snapshot del docente al momento de registrar)',
    },
    cargo: {
      type: DataTypes.STRING(80),
      allowNull: true,
      defaultValue: CARGO_TRIBUNAL_ACTA_DEFENSA_DEFAULT,
      comment: 'Rótulo impreso entre paréntesis',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'tribunal_acta_defensa',
  }
);

export default TribunalActaDefensa;
