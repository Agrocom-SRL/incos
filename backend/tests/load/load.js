// Load: rampa a 50 VUs, meseta y bajada. Carga esperada de uso normal/pico.
import { ejecutar, setup as prep, resumen } from './lib/perfil.js';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
    checks: ['rate>0.99'],
  },
};
export const setup = prep;
export default ejecutar;
export const handleSummary = resumen('load');
