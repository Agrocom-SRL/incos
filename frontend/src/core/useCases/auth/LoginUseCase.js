import { User } from '@entities/User';

export class LoginUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(credentials) {
    try {
      // Validaciones
      if (!credentials.email || !credentials.password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        throw new Error('Formato de email inválido');
      }

      // Ejecutar login
      const response = await this.authRepository.login(credentials);

      // Convertir a entidad User
      const user = new User(response.user);

      // Verificar si puede acceder
      if (!user.canAccess()) {
        throw new Error('Usuario inactivo. Contacte al administrador.');
      }

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
