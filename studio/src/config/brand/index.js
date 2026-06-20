/**
 * Selector del tenant activo (white-label).
 *
 * Responsabilidad ÚNICA: resolver QUÉ marca usa esta instancia. Hoy retorna INCOS;
 * mañana puede leer un subdominio, una variable de entorno o un endpoint multi-tenant
 * sin que ningún consumidor (theme, shell) cambie — todos importan `activeBrand`.
 */
import { incosBrand } from './incos.brand';

const registry = {
  incos: incosBrand,
};

const tenantId = import.meta.env?.VITE_TENANT ?? 'incos';

export const activeBrand = registry[tenantId] ?? incosBrand;

export default activeBrand;
