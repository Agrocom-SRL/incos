/**
 * Estado de materias seleccionadas por periodo (wizard paso 3).
 */

import { useState, useCallback } from 'react';

export const useMatriculaWizardMateriasSelection = (editData) => {
  const [selectedMateriaIdsByPeriod, setSelectedMateriaIdsByPeriod] = useState({});

  // Siembra desde editData (ajuste durante render con comparación de prev, sin setState en effect)
  const [prevMateriaIdsByPeriod, setPrevMateriaIdsByPeriod] = useState(null);
  if (editData?.materiaIdsByPeriod !== prevMateriaIdsByPeriod) {
    setPrevMateriaIdsByPeriod(editData?.materiaIdsByPeriod);
    if (editData?.materiaIdsByPeriod && typeof editData.materiaIdsByPeriod === 'object') {
      const byPeriod = {};
      Object.entries(editData.materiaIdsByPeriod).forEach(([key, ids]) => {
        if (Array.isArray(ids) && ids.length > 0) {
          byPeriod[String(key)] = ids.map(Number);
        }
      });
      if (Object.keys(byPeriod).length > 0) {
        setSelectedMateriaIdsByPeriod((prev) => {
          if (Object.keys(prev).length > 0) return prev;
          return byPeriod;
        });
      }
    }
  }

  const handleToggleMaterias = useCallback((periodId, materiaIds) => {
    setSelectedMateriaIdsByPeriod((prev) => ({
      ...prev,
      [periodId]: Array.isArray(materiaIds) ? materiaIds : [],
    }));
  }, []);

  return { selectedMateriaIdsByPeriod, handleToggleMaterias };
};
