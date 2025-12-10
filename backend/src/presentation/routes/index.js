import express from 'express';
import studentRoutes from './student.routes.js';

const router = express.Router();

// Rutas base
router.get('/', (req, res) => {
  res.json({
    message: 'API Instituto INCOS v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      estudiantes: '/api/v1/estudiantes',
      inscripciones: '/api/v1/inscripciones',
      calificaciones: '/api/v1/calificaciones',
      docentes: '/api/v1/docentes',
    },
  });
});

// Montar rutas de módulos
router.use('/estudiantes', studentRoutes);

export default router;
