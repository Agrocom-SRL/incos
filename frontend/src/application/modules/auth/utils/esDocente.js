/**
 * Helpers de rol — detección por código de rol del usuario autenticado.
 *
 * El `usuario` viene de `useAuth()` / `useAuthContext()` (GET /auth/me) y expone
 * `rol.codigo` y `vinculo_perfil`. Centralizar la comprobación evita repetir el
 * literal del código de rol por toda la app (mismo patrón que `labelByRole`).
 */

/** Código del rol de docente en el catálogo de roles del sistema. */
export const ROL_DOCENTE = 'DOCENTE';

/**
 * @param {{ rol?: { codigo?: string } } | null | undefined} usuario
 * @returns {boolean} true si el usuario autenticado tiene rol DOCENTE.
 */
export const esDocente = (usuario) => usuario?.rol?.codigo === ROL_DOCENTE;
