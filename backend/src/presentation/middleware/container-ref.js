/**
 * Referencia al contenedor DI para middlewares sin importar container/index.js
 * (evita ciclos: routes → middleware → container → routes).
 */

let appContainer = null;

export function setAppContainer(container) {
  appContainer = container;
}

export function getAppContainer() {
  if (!appContainer) {
    throw new Error('Contenedor DI no inicializado');
  }
  return appContainer;
}
