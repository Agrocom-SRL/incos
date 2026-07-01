// src/presentation/modules/seguridad/routes.jsx
/**
 * Rutas del dominio Seguridad (SEG). Compone los dos ítems de menú, cada uno
 * autónomo en su subdirectorio:
 * - `usuariosRoutes` (subdir `usuarios/`): manejo de usuarios, privilegios y credenciales.
 * - `rolesRoutes` (subdir `roles/`): roles y permisos.
 * Paths bajo `/seguridad/...`; menú con `parent: 'SEG'` (dominio en dominios/routes.jsx).
 */

import { usuariosRoutes } from '@modules/seguridad/usuarios/routes.jsx';
import { rolesRoutes } from '@modules/seguridad/roles/routes.jsx';

export const seguridadRoutes = [...usuariosRoutes, ...rolesRoutes];

export default seguridadRoutes;
