// modules/estudiantes/connectors/index.js
/**
 * Exporta los connectors del módulo de estudiantes
 * 
 * Single Responsibility: Centralizar la exportación y lazy loading de todos los connectors
 * 
 * Clean Architecture:
 * - Presentation Layer: Encapsula la lógica de lazy loading de connectors
 * - Routes solo importa desde aquí, sin preocuparse de cómo se cargan
 * 
 * Ventajas:
 * - Mantiene routes.jsx limpio (no necesita conocer detalles de lazy loading)
 * - Facilita agregar nuevos connectors sin modificar routes.jsx (Open/Closed Principle)
 * - Todos los connectors siguen el mismo patrón de lazy loading
 */
import { lazy } from 'react';

export const ListConnector = lazy(() => import('@estudiantes/connectors/ListConnector'));
export const RegisterConnector = lazy(() => import('@estudiantes/connectors/RegisterConnector'));
export const DetailConnector = lazy(() => import('@estudiantes/connectors/DetailConnector'));
export const EditConnector = lazy(() => import('@estudiantes/connectors/EditConnector'));
