/**
 * Entidad User - Representa un usuario en el dominio
 */
export class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.lastName = data.lastName;
    this.role = data.role || 'student'; // student, teacher, admin
    this.avatar = data.avatar;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt;
  }

  /**
   * Obtiene el nombre completo
   */
  getFullName() {
    return `${this.name} ${this.lastName}`.trim();
  }

  /**
   * Verifica si es administrador
   */
  isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Verifica si es profesor
   */
  isTeacher() {
    return this.role === 'teacher';
  }

  /**
   * Verifica si es estudiante
   */
  isStudent() {
    return this.role === 'student';
  }

  /**
   * Verifica si el usuario está activo
   */
  canAccess() {
    return this.isActive;
  }
}
