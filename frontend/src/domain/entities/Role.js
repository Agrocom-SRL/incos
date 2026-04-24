export class Role {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.codigo = data.codigo ?? '';
    this.nombre = data.nombre ?? '';
    this.nivelAcceso = data.nivelAcceso ?? data.nivel_acceso ?? null;
    this.activo = data.activo ?? null;
  }
}

