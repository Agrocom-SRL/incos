/**
 * Interfaz del repositorio de autenticación
 */
export class IAuthRepository {
  async login(_credentials) {
    throw new Error('Method login() must be implemented');
  }

  async logout() {
    throw new Error('Method logout() must be implemented');
  }

  async getCurrentUser() {
    throw new Error('Method getCurrentUser() must be implemented');
  }

  async register(_userData) {
    throw new Error('Method register() must be implemented');
  }

  async forgotPassword(_email) {
    throw new Error('Method forgotPassword() must be implemented');
  }

  async resetPassword(_token, _newPassword) {
    throw new Error('Method resetPassword() must be implemented');
  }
}