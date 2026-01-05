/**
 * Hook: useContactosEmergenciaDinamicos
 * 
 * Single Responsibility: Gestionar el estado dinámico de contactos de emergencia (agregar/eliminar contactos)
 * 
 * Clean Architecture:
 * - Application Layer: Hook específico para la lógica de estado de contactos de emergencia dinámicos
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo maneja el estado y lógica de agregar/eliminar contactos
 * 
 * Este hook:
 * - Gestiona cuántos contactos de emergencia hay (array de índices)
 * - Proporciona funciones para agregar y eliminar contactos
 * 
 * NOTA: La generación de campos se hace en la capa de presentación (config)
 */

import { useState, useCallback } from 'react';

/**
 * Hook para manejar el estado de contactos de emergencia dinámicos
 * 
 * @returns {Object} Objeto con estado y funciones para manejar contactos dinámicos
 */
export const useContactosEmergenciaDinamicos = () => {
  // Estado: array de índices de contactos (empezamos con 1 contacto: [0])
  const [contactosIndices, setContactosIndices] = useState([0]);

  /**
   * Agregar un nuevo contacto de emergencia
   */
  const agregarContacto = useCallback(() => {
    setContactosIndices((prev) => {
      // Encontrar el siguiente índice disponible
      const maxIndex = Math.max(...prev, -1);
      return [...prev, maxIndex + 1];
    });
  }, []);

  /**
   * Eliminar un contacto de emergencia
   * @param {number} index - Índice del contacto a eliminar
   */
  const eliminarContacto = useCallback((index) => {
    setContactosIndices((prev) => {
      // No permitir eliminar si solo hay un contacto
      if (prev.length <= 1) return prev;
      return prev.filter((idx) => idx !== index);
    });
  }, []);

  return {
    contactosIndices,
    agregarContacto,
    eliminarContacto,
    cantidadContactos: contactosIndices.length,
  };
};

