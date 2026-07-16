/**
 * El backend arma el 403 como `Cuenta ${estado}` con el ENUM en masculino
 * ("Cuenta bloqueado"); aquí se concuerda con el género de "cuenta" antes
 * de mostrarlo al usuario.
 */
const ESTADO_CUENTA_LABEL = {
  bloqueado: 'bloqueada',
  suspendido: 'suspendida',
  retirado: 'retirada',
};

function concordarEstadoCuenta(msg) {
  return String(msg).replace(
    /\b(bloqueado|suspendido|retirado)\b/gi,
    (estado) => ESTADO_CUENTA_LABEL[estado.toLowerCase()] || estado,
  );
}

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
    return concordarEstadoCuenta(msg.startsWith('Cuenta ') ? msg : `Cuenta ${msg}`);
  }

  if (status === 422 || status) {
    return error?.message || 'No se pudo iniciar sesión';
  }

  return 'Error de red. Intente nuevamente.';
}
