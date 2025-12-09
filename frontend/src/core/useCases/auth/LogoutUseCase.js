export class LogoutUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute() {
    try {
      await this.authRepository.logout();

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
