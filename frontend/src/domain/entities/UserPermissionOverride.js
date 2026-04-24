export class UserPermissionOverride {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.usuarioId = data.usuarioId ?? data.usuario_id ?? null;
    this.permisoId = data.permisoId ?? data.permiso_id ?? null;
    this.permisoCodigo = data.permisoCodigo ?? data.codigo ?? null;
    this.permisoNombre = data.permisoNombre ?? data.nombre ?? null;
    this.accion = data.accion ?? null;
    this.tipo = data.tipo ?? null;
    this.motivo = data.motivo ?? null;
    this.activo = data.activo ?? null;
  }
}

