/**
 * Hook: useAsignarBecaBecasDescuentos
 * 
 * Single Responsibility: Orquestar la carga y selección de becas y descuentos para el formulario de asignación
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que encapsula la dependencia del hook de API
 * - Usa hooks de API del módulo de estudiantes
 * 
 * Este hook:
 * - Encapsula el uso de useBecasDescuentosApi
 * - Maneja la selección de la beca/descuento
 * - Proporciona handler para seleccionar beca (actualiza form)
 * - Proporciona función para renderizar cards de beca
 * - Agrega lógica específica para el formulario de asignación si es necesario
 * - Expone una interfaz específica para el contexto de asignar beca
 * 
 * Ventajas:
 * - Encapsula la dependencia del hook de API
 * - Permite agregar lógica específica de asignación sin modificar el hook genérico
 * - Facilita el testing y mantenimiento
 * - Separa la lógica del Provider (Provider solo orquesta)
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useBecasDescuentosApi } from '@application-matricula/becas/hooks/api/useBecasDescuentosApi';

/**
 * Hook para cargar y seleccionar becas y descuentos en el contexto de asignar beca
 * 
 * @param {Object} options - Opciones adicionales
 * @param {Object} options.form - Instancia del formulario de Ant Design (opcional)
 * @returns {Object} Objeto con becasDescuentos, loading, error, refetch, selectedBecaDescuento, onSelectBecaDescuento, handleSelectBeca
 */
export const useAsignarBecaBecasDescuentos = (options = {}) => {
  const { form, initialBecaDescuentoId = null } = options;

  // Usar el hook genérico de becas y descuentos
  const { becasDescuentos, loading, error, refetch } = useBecasDescuentosApi();

  // Estado para la beca/descuento seleccionada
  const [selectedBecaDescuento, setSelectedBecaDescuento] = useState(null);

  /**
   * Función para manejar la selección de una beca/descuento
   * Guarda el ID y datos básicos de la beca/descuento
   * 
   * @param {Object} becaDescuento - Beca/descuento seleccionada (con id, nombre, codigo, porcentaje, etc.)
   */
  const onSelectBecaDescuento = useCallback((becaDescuento) => {
    if (becaDescuento && becaDescuento.id) {
      // ✅ OPTIMIZACIÓN: Solo actualizar si realmente cambió
      setSelectedBecaDescuento(prev => {
        // Si ya está seleccionada la misma beca/descuento, mantener referencia
        if (prev?.id === becaDescuento.id) {
          return prev;
        }
        
        // Si cambió, crear nuevo objeto
        return {
          id: becaDescuento.id,
          nombre: becaDescuento.nombre,
          codigo: becaDescuento.codigo,
          porcentaje: becaDescuento.porcentaje,
          descripcion: becaDescuento.descripcion,
        };
      });
    }
  }, []);

  /**
   * Handler para seleccionar una beca/descuento (actualiza estado y formulario)
   * 
   * @param {Object} beca - Beca/descuento seleccionada
   */
  const handleSelectBeca = useCallback((beca) => {
    onSelectBecaDescuento(beca);
    // Actualizar el formulario con el ID de la beca seleccionada
    if (form) {
      form.setFieldsValue({ becaDescuentoId: beca.id });
    }
  }, [onSelectBecaDescuento, form]);

  useEffect(() => {
    if (!initialBecaDescuentoId || !Array.isArray(becasDescuentos) || becasDescuentos.length === 0) return;
    if (selectedBecaDescuento?.id === Number(initialBecaDescuentoId)) return;
    const initial = becasDescuentos.find((b) => Number(b.id) === Number(initialBecaDescuentoId));
    if (initial) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza la beca inicial con el formulario al cargar el catálogo
      handleSelectBeca(initial);
    }
  }, [initialBecaDescuentoId, becasDescuentos, selectedBecaDescuento?.id, handleSelectBeca]);

  // Referencia estable: useMemo solo recrea el objeto si cambia alguna dependencia
  return useMemo(() => ({
      becasDescuentos,
      loading,
      error,
      refetch,
      selectedBecaDescuento,
      onSelectBecaDescuento,
      handleSelectBeca,
    }), [becasDescuentos, loading, error, refetch, selectedBecaDescuento, onSelectBecaDescuento, handleSelectBeca]);
};
