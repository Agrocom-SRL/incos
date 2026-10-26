// Smoke: 1 VU, 1 minuto. Verifica que los escenarios funcionan antes de cargar.
import { ejecutar, setup as prep, resumen } from './lib/perfil.js';

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
    checks: ['rate>0.99'],
  },
};
export const setup = prep;
export default ejecutar;
export const handleSummary = resumen('smoke');
