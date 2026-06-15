/**
 * @param {Error & { status?: number, payload?: object }} error
 * @returns {string}
 */
export function mapLoginErrorMessage(error) {
  const status = error?.status;
  const payload = error?.payload;

  if (status === 401) {
    return 'Usuario o contraseña incorrectos';
  }

  if (status === 403) {
    const msg =
      typeof payload?.error === 'string'
        ? payload.error
        : payload?.error?.message || error?.message || 'no disponible';
    return msg.startsWith('Cuenta ') ? msg : `Cuenta ${msg}`;
  }

  if (status === 422 || status) {
    return error?.message || 'No se pudo iniciar sesión';
  }

  return 'Error de red. Intente nuevamente.';
}
