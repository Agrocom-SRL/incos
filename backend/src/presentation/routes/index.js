import express from 'express';
import studentRoutes from './student.routes.js';

const router = express.Router();

// ============================================
// RUTA BASE - Información de la API
// ============================================
router.get('/', (req, res) => {
  // Solo mostrar endpoints implementados
  const endpoints = {
    estudiantes: '/api/v1/estudiantes',
  };

  res.json({
    message: 'API Instituto INCOS v1',
    version: '1.0.0',
    endpoints,
  });
});

// ============================================
// MÓDULOS - Rutas organizadas por dominio
// ============================================
// IMPORTANTE: Solo descomentar cuando el módulo esté implementado

// Módulo: Gestión de Estudiantes (EST)
router.use('/estudiantes', studentRoutes);

// Para agregar un nuevo módulo:
// 1. Crear archivo: routes/{modulo}.routes.js
// 2. Importar: import {modulo}Routes from './{modulo}.routes.js';
// 3. Montar: router.use('/{modulo}', {modulo}Routes);
// 4. Agregar endpoint en la ruta base '/'

export default router;
