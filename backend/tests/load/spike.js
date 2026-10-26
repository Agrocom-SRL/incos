// Spike: salto brusco de carga y recuperación. Thresholds laxos; interesa que el servicio
// se recupere (baja de errores en la fase final).
import { ejecutar, setup as prep, resumen } from './lib/perfil.js';

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '15s', target: 150 },
    { duration: '1m', target: 150 },
    { duration: '15s', target: 5 },
    { duration: '1m', target: 5 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<3000'],
  },
};
export const setup = prep;
export default ejecutar;
export const handleSummary = resumen('spike');
