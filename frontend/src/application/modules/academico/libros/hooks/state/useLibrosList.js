/**
 * Estado de pantalla — Listado de libros de registro (P1 · LibrosListPage).
 *
 * Orquesta el listado (`useLibrosApi`), el filtro local por texto, los
 * catálogos de carreras/gestiones para el modal "Abrir libro" y la mutación de
 * alta (`useAbrirLibroApi`). Toda la orquestación vive aquí; la página solo
 * compone (incos-frontend-module §2).
 */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useCarrerasCatalogApi, useGestionesCatalogApi } from '@application-shared/hooks';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs';
import { createLibrosTableColumns } from '@academico/libros/config/librosTableColumns';
import { libroDetallePath } from '../../utils/librosPaths';
import { useLibrosApi } from '../api/useLibrosApi';
import { useAbrirLibroApi } from '../api/useAbrirLibroApi';

/** Normaliza para comparar sin acentos ni mayúsculas. */
const normalizar = (valor) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export const useLibrosList = () => {
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const { libros, loading, error, refetch } = useLibrosApi();
  const { carreras, loading: loadingCarreras } = useCarrerasCatalogApi();
  const { gestiones, loading: loadingGestiones } = useGestionesCatalogApi();
  const { abrirLibro, loading: abriendo } = useAbrirLibroApi();

  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const librosFiltrados = useMemo(() => {
    const termino = normalizar(searchText);
    if (!termino) return libros;
    return libros.filter((libro) =>
      [
        libro.carreraNombre,
        libro.gestionNombre,
        libro.gestionAnio,
        libro.codigoRegistro,
        libro.numeroLibro,
      ]
        .map(normalizar)
        .some((campo) => campo.includes(termino)),
    );
  }, [libros, searchText]);

  const handleSearchChange = useCallback((event) => setSearchText(event.target.value), []);

  const abrirModal = useCallback(() => setModalOpen(true), []);
  const cerrarModal = useCallback(() => setModalOpen(false), []);

  const handleAbrirLibro = useCallback(
    async (payload) => {
      const result = await abrirLibro(payload);
      if (result.success) {
        notification.success({
          title: 'Libro abierto',
          description: `Se abrió el LIBRO N° ${result.data?.numeroLibro} de ${result.data?.carreraNombre || 'la carrera elegida'} correctamente.`,
        });
        setModalOpen(false);
        await refetch();
        if (result.data?.id != null) {
          navigate(libroDetallePath(result.data.id));
        }
      } else {
        notification.error({
          title: 'No se pudo abrir el libro de registro',
          description: result.error,
        });
      }
      return result;
    },
    [abrirLibro, refetch, navigate, notification],
  );

  const tableColumns = useMemo(() => createLibrosTableColumns({ navigate }), [navigate]);

  const breadcrumbItems = useMemo(() => createBreadcrumbItems('ACA-LIBROS', 'ACA-LIBROS'), []);

  return {
    libros: librosFiltrados,
    loading,
    error,
    searchText,
    handleSearchChange,
    tableColumns,
    breadcrumbItems,
    modalOpen,
    abrirModal,
    cerrarModal,
    handleAbrirLibro,
    abriendo,
    carreras,
    loadingCarreras,
    gestiones,
    loadingGestiones,
  };
};

export default useLibrosList;
