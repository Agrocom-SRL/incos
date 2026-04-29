/**
 * Serializa fila SQL de usuario + rol (admin SEG) sin password.
 */
export function mapUsuarioAdminRow(u) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    foto_url: u.foto_url ?? null,
    estado: u.estado ?? null,
    activo: Boolean(u.activo),
    created_at: u.created_at,
    updated_at: u.updated_at ?? null,
    fecha_cambio_estado: u.fecha_cambio_estado ?? null,
    motivo_cambio_estado: u.motivo_cambio_estado ?? null,
    referencia_id: u.referencia_id ?? null,
    tipo_referencia: u.tipo_referencia ?? null,
    rol: u.rol_id
      ? {
          id: u.rol_id,
          codigo: u.rol_codigo,
          nombre: u.rol_nombre,
          tipo: u.rol_tipo ?? null,
          is_system: Boolean(u.rol_is_system),
        }
      : null,
  };
}
