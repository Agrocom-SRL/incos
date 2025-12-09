export class InvalidCredentialsError extends Error {
  constructor() {
    super('Email o contraseña incorrectos');
    this.name = 'InvalidCredentialsError';
  }
}

export class UserNotFoundError extends Error {
  constructor(email) {
    super(`Usuario con email ${email} no encontrado`);
    this.name = 'UserNotFoundError';
  }
}

export class UserInactiveError extends Error {
  constructor() {
    super('Usuario inactivo. Contacte al administrador.');
    this.name = 'UserInactiveError';
  }
}

export class TokenExpiredError extends Error {
  constructor() {
    super('Sesión expirada. Por favor inicie sesión nuevamente.');
    this.name = 'TokenExpiredError';
  }
}
