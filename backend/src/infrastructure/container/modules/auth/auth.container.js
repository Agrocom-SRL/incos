/**
 * Registro DI: módulo Auth (login, me, logout).
 */

import { AUTH_TOKENS } from '../../tokens/auth.tokens.js';
import { REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { LoginUseCase } from '../../../../application/use-cases/auth/LoginUseCase.js';
import { LogoutUseCase } from '../../../../application/use-cases/auth/LogoutUseCase.js';
import { MeUseCase } from '../../../../application/use-cases/auth/MeUseCase.js';
import { AuthController } from '../../../../presentation/controllers/auth/auth.controller.js';
import { buildAuthRouter } from '../../../../presentation/routes/auth.routes.js';

export function registerAuthModule(container) {
  registerComponent(
    container,
    AUTH_TOKENS.loginUseCase,
    (c) =>
      new LoginUseCase({
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
      })
  );

  registerComponent(
    container,
    AUTH_TOKENS.logoutUseCase,
    (c) =>
      new LogoutUseCase({
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
      })
  );

  registerComponent(
    container,
    AUTH_TOKENS.meUseCase,
    (c) =>
      new MeUseCase({
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
      })
  );

  registerComponent(
    container,
    AUTH_TOKENS.authController,
    (c) =>
      new AuthController({
        loginUseCase: c.resolve(AUTH_TOKENS.loginUseCase),
        logoutUseCase: c.resolve(AUTH_TOKENS.logoutUseCase),
        meUseCase: c.resolve(AUTH_TOKENS.meUseCase),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    AUTH_TOKENS.authRouter,
    (c) =>
      buildAuthRouter({
        authController: c.resolve(AUTH_TOKENS.authController),
      })
  );

  return container;
}
