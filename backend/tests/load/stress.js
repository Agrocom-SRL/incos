// Stress: rampas crecientes hasta romper. Thresholds laxos: el objetivo es hallar el límite,
// no que pase. Si el threshold de errores aborta la prueba, ese es el punto de quiebre.
import { ejecutar, setup as prep, resumen } from './lib/perfil.js';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: [{ threshold: 'rate<0.30', abortOnFail: true, delayAbortEval: '1m' }],
    http_req_duration: ['p(95)<5000'],
  },
};
export const setup = prep;
export default ejecutar;
export const handleSummary = resumen('stress');
