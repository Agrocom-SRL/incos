const express = require('express');
const router = express.Router();

// TODO: Importar rutas de módulos aquí
// const authRoutes = require('./auth.routes');
// const estudiantesRoutes = require('./estudiantes.routes');
// etc...

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
      docentes: '/api/v1/docentes'
    }
  });
});

// Montar rutas de módulos
// router.use('/auth', authRoutes);
// router.use('/estudiantes', estudiantesRoutes);

module.exports = router;
