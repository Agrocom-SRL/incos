/**
 * Toggle rápido del campo `activo` para los catálogos de Configuración
 * (columna "Estado" del listado, átomo `EstadoTogglePill`).
 *
 * Compartido por los feature hooks de listado de Complementarios (discapacidades,
 * apoderados, idiomas, estados civiles) y Recursos académicos (aulas, paralelos,
 * tipos de evaluación): ejecuta el use case `cambiarEstado*` del container
 * (PATCH /:id/estado), da feedback con message (App.useApp, AntD 6) y recarga
 * el listado si tuvo éxito. En error NO relanza: el feedback ya se dio aquí y
 * la pill solo apaga su loading.
 */

import { useCallback } from 'react';
import { App } from 'antd';
import { useCasesFactory } from '@container';

/**
 * @param {Object} params
 * @param {string} params.useCaseKey - Clave del use case en el container (ej. 'cambiarEstadoIdioma')
 * @param {string} params.entidad - Texto humano singular, ej. 'el idioma'
 * @param {Function} params.refetch - Recargar el listado tras el cambio
 * @returns {Function} (record, nuevoActivo) => Promise — firma que espera `estadoToggle.onToggle`
 */
export const useToggleEstadoCatalogo = ({ useCaseKey, entidad, refetch }) => {
  const { message } = App.useApp();

  return useCallback(
    async (record, nuevoActivo) => {
      const result = await useCasesFactory[useCaseKey]().ejecutar(record.id, nuevoActivo);
      if (!result?.success) {
        message.error(result?.error || `No se pudo cambiar el estado de ${entidad}`);
        return;
      }
      const nombre = record?.nombre ? ` «${record.nombre}»` : '';
      message.success(`Se ${nuevoActivo ? 'activó' : 'desactivó'} ${entidad}${nombre}`);
      await refetch();
    },
    [useCaseKey, entidad, refetch, message],
  );
};
