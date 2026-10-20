/**
 * Estado de materias seleccionadas por periodo (paso «Periodo y materias»).
 *
 * Fuentes de la selección inicial:
 * - Edición: editData.materiaIdsByPeriod (selecciones actuales de la inscripción).
 * - Creación: computeInitialSelection sobre el contexto de matrícula (NUEVO →
 *   bloque completo del periodo 1; con historial digital → pendientes a
 *   nivelar pre-marcadas). Se re-siembra al cambiar estudiante/plan.
 *
 * Además poda al marcar/desmarcar (solo creación) las materias que dejan de
 * ser válidas según las reglas en vivo de la planilla (prerrequisito
 * descubierto al bajar el periodo mínimo seleccionado, aprobadas, periodos
 * deshabilitados) para que el payload siempre refleje lo que el backend
 * aceptará (pruneSeleccionInvalida). Las siembras iniciales ya nacen válidas
 * por construcción, así que el toggle es la única mutación que puede
 * invalidar la selección.
 */

import { useState } from 'react';
import {
  computeInitialSelection,
  pruneSeleccionInvalida,
} from '@application-matricula/registro/utils/materiasPlanillaRules';

export const useMatriculaWizardMateriasSelection = ({
  editData = null,
  contexto = null,
  tipoAdmision = null,
  esNuevoSistema = null,
  traspasoAnioCursado = null,
} = {}) => {
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

  // Siembra desde el contexto de matrícula (solo creación): al cambiar de
  // estudiante o de plan la selección anterior deja de tener sentido y se
  // reemplaza por la inicial de las reglas (mismo patrón render-adjust).
  const seedKey = contexto
    ? `${contexto.estudiante?.id ?? ''}|${contexto.plan?.id ?? ''}`
    : null;
  const [prevSeedKey, setPrevSeedKey] = useState(null);
  if (seedKey !== prevSeedKey) {
    setPrevSeedKey(seedKey);
    if (!editData && seedKey) {
      setSelectedMateriaIdsByPeriod(
        computeInitialSelection({ contexto, tipoAdmision, esNuevoSistema, traspasoAnioCursado })
      );
    }
  }

  // Sin useCallback manual: React Compiler memoiza el handler (y sus deps
  // reales: editData/contexto/perfil) sin bailout por memoización previa.
  const handleToggleMaterias = (periodId, materiaIds) => {
    setSelectedMateriaIdsByPeriod((prev) => {
      const siguiente = {
        ...prev,
        [periodId]: Array.isArray(materiaIds) ? materiaIds : [],
      };
      // Poda al marcar/desmarcar (solo creación): mantiene la selección
      // coherente con las reglas en vivo de la planilla.
      if (editData || !contexto) return siguiente;
      return pruneSeleccionInvalida({
        contexto,
        seleccion: siguiente,
        tipoAdmision,
        esNuevoSistema,
        traspasoAnioCursado,
      });
    });
  };

  return { selectedMateriaIdsByPeriod, handleToggleMaterias };
};
