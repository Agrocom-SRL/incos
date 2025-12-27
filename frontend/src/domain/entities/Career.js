/**
 * Entidad de Dominio: Career
 * Representa una carrera académica
 * Contiene la lógica de negocio pura de la carrera
 * 
 * Single Responsibility: Solo maneja la lógica de negocio de la carrera
 */

export class Career {
  constructor(data = {}) {
    // Datos básicos
    this.id = data.id || null;
    this.codigo = data.codigo || data.code || null;
    this.nombre = data.nombre || data.name || null;
    this.label = data.label || this.nombre || null; // Para UI
    this.descripcion = data.descripcion || data.description || null;
    this.activa = data.activa !== undefined ? data.activa : true;
    
    // Datos académicos
    this.duracionAnios = data.duracionAnios || data.durationYears || data.duracion_anios || null;
    this.tituloOtorgado = data.tituloOtorgado || data.grantedTitle || data.titulo_otorgado || null;
    this.resolucionMinisterial = data.resolucionMinisterial || data.ministerialResolution || data.resolucion_ministerial || null;
    this.fechaVigencia = data.fechaVigencia || data.effectiveDate || data.fecha_vigencia || null;
    this.cargaHorariaTotal = data.cargaHorariaTotal || data.totalHours || data.carga_horaria_total || null;
    
    // UI
    this.colorHex = data.colorHex || data.color_hex || null;
    this.image = data.image || data.imagen || null;
    
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
   * @returns {Object}
   */
  toPlainObject() {
    return {
      id: this.id,
      codigo: this.codigo,
      nombre: this.nombre,
      descripcion: this.descripcion,
      activa: this.activa,
      duracionAnios: this.duracionAnios,
      tituloOtorgado: this.tituloOtorgado,
      resolucionMinisterial: this.resolucionMinisterial,
      fechaVigencia: this.fechaVigencia,
      cargaHorariaTotal: this.cargaHorariaTotal,
      colorHex: this.colorHex,
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
      image: this.image,
      colorHex: this.colorHex,
      duracionAnios: this.duracionAnios,
      tituloOtorgado: this.tituloOtorgado,
      gestionId: this.gestionId,
      turnoId: this.turnoId,
    };
  }
}

