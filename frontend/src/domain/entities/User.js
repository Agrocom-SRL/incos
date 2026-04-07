export class User {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.username = data.username ?? '';
    this.email = data.email ?? '';
    this.fotoUrl = data.fotoUrl ?? data.foto_url ?? null;
    this.estado = data.estado ?? null;
    this.activo = data.activo ?? null;
    this.rolId = data.rolId ?? data.rol_id ?? null;
    this.rolCodigo = data.rolCodigo ?? data.rol_codigo ?? null;
    this.rolNombre = data.rolNombre ?? data.rol_nombre ?? null;
    this.rolNivel = data.rolNivel ?? data.rol_nivel ?? data.nivel_acceso ?? null;
    this.referenciaId = data.referenciaId ?? data.referencia_id ?? null;
    this.tipoReferencia = data.tipoReferencia ?? data.tipo_referencia ?? null;
    this.createdAt = data.createdAt ?? data.created_at ?? null;
    this.updatedAt = data.updatedAt ?? data.updated_at ?? null;
  }
}

