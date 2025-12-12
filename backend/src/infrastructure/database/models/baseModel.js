import { DataTypes } from 'sequelize';

/**
 * Campos comunes para todos los modelos
 * Factoriza el ID y los campos de auditoría estándar
 */
export const baseModelFields = {
  /**
   * ID único del registro (AUTO_INCREMENT PRIMARY KEY)
   */
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  /**
   * Campo de auditoría: Registro activo/inactivo
   */
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Registro activo/inactivo',
  },

  /**
   * Campo de auditoría: Fecha de creación
   */
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    allowNull: false,
  },

  /**
   * Campo de auditoría: Fecha de modificación
   */
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    allowNull: false,
  },

  /**
   * Campo de auditoría: Fecha de eliminación (soft delete)
   */
  deletedAt: {
    type: DataTypes.DATE,
    field: 'deleted_at',
    allowNull: true,
  },

  /**
   * Campo de auditoría: Usuario que creó el registro
   */
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by',
    allowNull: true,
  },

  /**
   * Campo de auditoría: Usuario que modificó el registro
   */
  updatedBy: {
    type: DataTypes.INTEGER,
    field: 'updated_by',
    allowNull: true,
  },

  /**
   * Campo de auditoría: Usuario que eliminó el registro
   */
  deletedBy: {
    type: DataTypes.INTEGER,
    field: 'deleted_by',
    allowNull: true,
  },
};

/**
 * Opciones comunes para todos los modelos
 */
export const baseModelOptions = {
  timestamps: true,
  underscored: true,
  paranoid: true, // Habilita soft delete (usa deletedAt)
};
