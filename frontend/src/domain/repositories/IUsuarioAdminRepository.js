import { IBaseRepository } from '@repositories/IBaseRepository';

export class IUsuarioAdminRepository extends IBaseRepository {
  async findAll() { throw new Error('Not implemented'); }
  async findById() { throw new Error('Not implemented'); }
  async create() { throw new Error('Not implemented'); }
  async update() { throw new Error('Not implemented'); }
  async changeEstado() { throw new Error('Not implemented'); }
  async changePassword() { throw new Error('Not implemented'); }
  async findPermisos() { throw new Error('Not implemented'); }
  async addOverride() { throw new Error('Not implemented'); }
  async removeOverride() { throw new Error('Not implemented'); }
}

