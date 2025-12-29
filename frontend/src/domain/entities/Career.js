/**
 * Entidad de Dominio: Career
 * Representa una carrera académica
 * Contiene la lógica de negocio pura de la carrera
 * 
 * Single Responsibility: Solo maneja la lógica de negocio de la carrera
 * Clean Architecture:
 * - Domain Layer: Extiende BaseEntity para reutilizar métodos comunes
 */

import { BaseEntity } from './BaseEntity.js';

export class Career extends BaseEntity {
  constructor(data = {}) {
    super(data); // Llamar al constructor de BaseEntity
    
    // Datos básicos
    // this.id ya viene de BaseEntity
    this.codigo = data.codigo || data.code || null;
    this.nombre = data.nombre || data.name || null;
    this.label = data.label || this.nombre || null; // Para UI
    this.descripcion = data.descripcion || data.description || null;
    // this.active ya viene de BaseEntity, pero también podemos usar activa para compatibilidad
    if (data.activa !== undefined) {
      this.active = data.activa;
      this.activa = data.activa;
    }
    
    // Datos académicos
    this.duracionAnios = data.duracionAnios || data.durationYears || data.duracion_anios || null;
    this.tituloOtorgado = data.tituloOtorgado || data.grantedTitle || data.titulo_otorgado || null;
    this.resolucionMinisterial = data.resolucionMinisterial || data.ministerialResolution || data.resolucion_ministerial || null;
    this.fechaVigencia = data.fechaVigencia || data.effectiveDate || data.fecha_vigencia || null;
    this.cargaHorariaTotal = data.cargaHorariaTotal || data.totalHours || data.carga_horaria_total || null;
    
    // UI
    this.colorHex = data.colorHex || data.color_hex || null;
    this.image = data.image || data.imagen || null; // Campo genérico para compatibilidad
    
    // Campos de imagen (estructura completa)
    this.imagenNombre = data.imagenNombre || data.imagen_nombre || data.imageName || null;
    this.imagenRuta = data.imagenRuta || data.imagen_ruta || data.imagePath || null;
    this.imagenUrl = data.imagenUrl || data.imagen_url || data.imageUrl || null;
    
    // Foreign keys
    this.gestionId = data.gestionId || null;
    this.turnoId = data.turnoId || null;
  }

  /**
   * Valida que la duración sea positiva
   * @returns {boolean}
   */
  isValidDuration() {
    if (!this.duracionAnios) return true; // Opcional
    return this.duracionAnios > 0;
  }

  /**
   * Valida el formato del color hexadecimal
   * @returns {boolean}
   */
  isValidColorHex() {
    if (!this.colorHex) return true; // Opcional
    return /^#[0-9A-F]{6}$/i.test(this.colorHex);
  }

  /**
   * Valida que el código no esté vacío
   * @returns {boolean}
   */
  isValidCode() {
    return !!this.codigo && this.codigo.trim().length > 0;
  }

  /**
   * Valida que el nombre no esté vacío
   * @returns {boolean}
   */
  isValidName() {
    return !!this.nombre && this.nombre.trim().length > 0;
  }

  /**
   * Valida todos los campos requeridos
   * @returns {{isValid: boolean, errors: string[]}}
   */
  validate() {
    const errors = [];

    if (!this.isValidCode()) {
      errors.push('El código de la carrera es requerido');
    }

    if (!this.isValidName()) {
      errors.push('El nombre de la carrera es requerido');
    }

    if (!this.isValidDuration()) {
      errors.push('La duración debe ser un número positivo');
    }

    if (!this.isValidColorHex()) {
      errors.push('El color hexadecimal debe tener el formato #RRGGBB');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convierte la entidad a objeto plano para enviar al backend
   * Extiende el método base agregando campos específicos de Career
   * @param {boolean} includeNulls - Si incluir campos null/undefined
   * @returns {Object}
   */
  toPlainObject(includeNulls = true) {
    const base = super.toPlainObject(includeNulls);
    
    return {
      ...base,
      codigo: this.codigo,
      nombre: this.nombre,
      descripcion: this.descripcion,
      activa: this.active || this.activa,
      duracionAnios: this.duracionAnios,
      tituloOtorgado: this.tituloOtorgado,
      resolucionMinisterial: this.resolucionMinisterial,
      fechaVigencia: this.fechaVigencia,
      cargaHorariaTotal: this.cargaHorariaTotal,
      colorHex: this.colorHex,
      imagenNombre: this.imagenNombre,
      imagenRuta: this.imagenRuta,
      imagenUrl: this.imagenUrl,
      gestionId: this.gestionId,
      turnoId: this.turnoId,
    };
  }

  /**
   * Convierte la entidad a formato para UI (con campos adicionales para display)
   * @returns {Object}
   */
  toUIData() {
    return {
      id: this.id,
      codigo: this.codigo,
      nombre: this.nombre,
      label: this.label || this.nombre,
      descripcion: this.descripcion,
      activa: this.activa,
      image: this.image || this.imagenUrl || this.imagenRuta, // Compatibilidad: usa imagenUrl o imagenRuta si image no existe
      imagenNombre: this.imagenNombre,
      imagenRuta: this.imagenRuta,
      imagenUrl: this.imagenUrl,
      colorHex: this.colorHex,
      duracionAnios: this.duracionAnios,
      tituloOtorgado: this.tituloOtorgado,
      gestionId: this.gestionId,
      turnoId: this.turnoId,
    };
  }
}

