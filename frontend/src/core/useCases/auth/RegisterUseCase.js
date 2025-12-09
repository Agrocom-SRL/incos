import { User } from '@entities/User';

export class RegisterUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(userData) {
    try {
      // Validaciones
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('Todos los campos son requeridos');
      }

      if (userData.password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }

      // Ejecutar registro
      const response = await this.authRepository.register(userData);

      // Convertir a entidad User
      const user = new User(response.user);

      return {
        success: true,
        data: {
          user,
          token: response.token,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
