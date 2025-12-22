import { ExpressApp } from './infrastructure/bootstrap/ExpressApp.js';

/**
 * Punto de entrada de Express
 * 
 * Solo instancia ExpressApp y exporta
 */
const expressApp = new ExpressApp();
const app = expressApp.getApp();

export default app;