import { describe, it, expect } from '@jest/globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describirControllers } from '../harness.js';

const dir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../../src/presentation/controllers/pagos'
);
describirControllers(describe, it, expect, dir, {
  GetEstadoAporteRegistroController: { req: { query: { estudiante_id: '5', gestion_id: '2' } } },
});
