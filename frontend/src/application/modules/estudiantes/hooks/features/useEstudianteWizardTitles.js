/**
 * Hook: useEstudianteWizardTitles
 * 
 * Single Responsibility: Gestionar los títulos dinámicos del wizard según el modo (completar/nuevo)
 * 
 * Clean Architecture:
 * - Application Layer: Hook específico para la lógica de títulos dinámicos
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo maneja la lógica de títulos según el modo
 * 
 * Este hook:
 * - Determina los títulos de pasos, formularios y secciones según completarMode
 * - Centraliza la lógica de transformación de títulos
 */

import { useMemo } from 'react';

/**
 * Hook para obtener los títulos del wizard según el modo
 * 
 * @param {boolean} completarMode - Si es true, usa títulos de modo "completar"
 * @returns {Object} Objeto con todos los títulos del wizard
 */
export const useEstudianteWizardTitles = (completarMode = false) => {
  const titles = useMemo(() => {
    // Títulos base (modo nuevo)
    const baseTitles = {
      step1: {
        title: 'Datos Generales',
        formTitle: 'Información Personal del Estudiante',
        sectionTitle: 'DATOS PERSONALES',
      },
      step2: {
        title: 'Contacto de Emergencia',
        formTitle: 'Datos de Contacto de Emergencia',
        sectionTitle: 'DATOS DE CONTACTO DE EMERGENCIA',
      },
      step3: {
        title: 'Documentación',
        formTitle: 'Documentación del Estudiante',
        sectionTitle: 'DOCUMENTACIÓN REQUERIDA',
      },
    };

    // Si es modo completar, agregar prefijo "Completar"
    if (completarMode) {
      return {
        step1: {
          title: `Completar ${baseTitles.step1.title}`,
          formTitle: `Completar ${baseTitles.step1.formTitle}`,
          sectionTitle: `Completar ${baseTitles.step1.sectionTitle}`,
        },
        step2: {
          title: `Completar ${baseTitles.step2.title}`,
          formTitle: `Completar ${baseTitles.step2.formTitle}`,
          sectionTitle: `Completar ${baseTitles.step2.sectionTitle}`,
        },
        step3: {
          title: `Completar ${baseTitles.step3.title}`,
          formTitle: `Completar ${baseTitles.step3.formTitle}`,
          sectionTitle: `Completar ${baseTitles.step3.sectionTitle}`,
        },
      };
    }

    return baseTitles;
  }, [completarMode]);

  return titles;
};

