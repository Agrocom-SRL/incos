/**
 * Hook de pantalla: ficha de un curso de capacitación (CAP · DETALLE).
 *
 * Espejo de `usePagosDetailPage`: orquesta la ficha sobre el contexto del
 * provider (breadcrumbs, volver, editar); la página es "dumb".
 *
 * También resuelve las transiciones de la máquina de estados del curso
 * (abrir inscripciones / cancelar). Solo `cancelar` (y `eliminar`, en otras
 * pantallas) piden confirmación con `modal.confirm`: son las únicas acciones
 * destructivas/irreversibles del módulo. `Abrir inscripciones` no es
 * destructiva, así que se ejecuta directo. Ambas dan feedback con
 * `notification` y refrescan la ficha.
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useCursoCapacitacionDetailContext } from '@application-capacitacion/cursos/hooks/context/useCursoCapacitacionDetailContext';
import { useCursoCapacitacionMutations } from '@application-capacitacion/cursos/hooks/api/useCursoCapacitacionMutations';
import {
  CURSOS_CAP_LIST_PATH,
  CAP_CURSOS_MENU_KEY,
  cursoCapEditarPath,
} from '@application-capacitacion/config/paths';

export const useCursoCapacitacionDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modal, notification } = App.useApp();

  const { cursoId, curso, loading, error, refetch } = useCursoCapacitacionDetailContext();
  const { abrirInscripciones, cancelarCurso } = useCursoCapacitacionMutations();
  const [procesandoTransicion, setProcesandoTransicion] = useState(false);

  const returnListPath = location.state?.returnListPath || CURSOS_CAP_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? CAP_CURSOS_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Capacitación' },
      { title: 'Cursos', href: returnListPath },
      { title: 'Detalle de curso' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!cursoId) return;
    navigate(cursoCapEditarPath(cursoId), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [navigate, cursoId, returnListPath, menuSidebarKey]);

  const puedeAbrir = curso?.estado === 'PROPUESTO';
  const puedeCancelar = ['PROPUESTO', 'ABIERTO'].includes(curso?.estado);

  const handleAbrirInscripciones = useCallback(async () => {
    if (!cursoId) return;
    setProcesandoTransicion(true);
    try {
      const result = await abrirInscripciones(cursoId);
      if (result?.success) {
        notification.success({
          title: 'Inscripciones abiertas',
          description: 'El curso ahora acepta inscripciones.',
        });
        await refetch();
      } else {
        notification.error({
          title: 'No se pudo abrir el curso',
          description: result?.error || 'Intente nuevamente en unos instantes.',
        });
      }
    } finally {
      setProcesandoTransicion(false);
    }
  }, [cursoId, abrirInscripciones, notification, refetch]);

  const handleCancelarCurso = useCallback(() => {
    if (!cursoId) return;
    modal.confirm({
      title: 'Cancelar curso',
      content:
        'El curso pasará a estado cancelado y no podrá reabrirse. Esta acción no se puede deshacer. ¿Desea continuar?',
      okText: 'Cancelar curso',
      okType: 'danger',
      cancelText: 'Volver',
      onOk: async () => {
        setProcesandoTransicion(true);
        try {
          const result = await cancelarCurso(cursoId);
          if (result?.success) {
            notification.success({
              title: 'Curso cancelado',
              description: 'El curso fue marcado como cancelado.',
            });
            await refetch();
          } else {
            notification.error({
              title: 'No se pudo cancelar el curso',
              description: result?.error || 'Intente nuevamente en unos instantes.',
            });
          }
        } finally {
          setProcesandoTransicion(false);
        }
      },
    });
  }, [cursoId, modal, cancelarCurso, notification, refetch]);

  return {
    cursoId,
    curso,
    loading,
    error,
    refetch,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    puedeAbrir,
    puedeCancelar,
    handleAbrirInscripciones,
    handleCancelarCurso,
    procesandoTransicion,
  };
};
