export class Permission {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.codigo = data.codigo ?? '';
    this.nombre = data.nombre ?? '';
    this.dominio = data.dominio ?? null;
    this.modulo = data.modulo ?? null;
    this.activo = data.activo ?? null;
  }
}

