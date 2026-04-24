import { IBaseRepository } from '@repositories/IBaseRepository';

export class IRolAdminRepository extends IBaseRepository {
  async findAll() { throw new Error('Not implemented'); }
  async findPermisosById() { throw new Error('Not implemented'); }
  async updatePermisos() { throw new Error('Not implemented'); }
}

