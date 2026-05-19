/**
 * Hook: notas de historial previo en el wizard de inscripción.
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  computeConcludedPeriods,
  buildHistorialPrevioRows,
  buildPriorHistoryPayload,
  validateHistorialPrevioGrades,
  historialPrevioRowKey,
  DEFAULT_NOTA_HISTORIAL,
  requiereHistorialPrevio,
  seedGradesFromPriorEnrollmentHistories,
} from '@application-inscripciones/utils/historialPrevioHelpers';

export const useInscripcionNuevaHistorialPrevio = ({
  tipoAdmision = null,
  periodos = [],
  selectedPeriodIds = [],
  periodosDisabledByTraspaso = null,
  materiasByPeriod = {},
  materiasLoading = false,
  initialPriorHistories = null,
  isEditMode = false,
}) => {
  const [gradesByKey, setGradesByKey] = useState(() =>
    seedGradesFromPriorEnrollmentHistories(initialPriorHistories)
  );
  const initializedRef = useRef(new Set());

  const needsHistorial = requiereHistorialPrevio(tipoAdmision);

  const concludedPeriods = useMemo(
    () =>
      computeConcludedPeriods({
        tipoAdmision,
        periodos,
        selectedPeriodIds,
        periodosDisabledByTraspaso,
      }),
    [tipoAdmision, periodos, selectedPeriodIds, periodosDisabledByTraspaso]
  );

  const rows = useMemo(
    () => buildHistorialPrevioRows(concludedPeriods, materiasByPeriod, gradesByKey),
    [concludedPeriods, materiasByPeriod, gradesByKey]
  );

  // Valores por defecto al cargar materias de periodos concluidos
  useEffect(() => {
    if (!needsHistorial || materiasLoading || concludedPeriods.length === 0) return;

    setGradesByKey((prev) => {
      let next = prev;
      let changed = false;

      for (const period of concludedPeriods) {
        const materias =
          materiasByPeriod?.[period.periodId] ??
          materiasByPeriod?.[String(period.periodId)] ??
          [];
        for (const materia of materias) {
          if (!materia?.id) continue;
          const key = historialPrevioRowKey(period.periodId, materia.id);
          const initKey = `${key}`;
          if (initializedRef.current.has(initKey)) continue;
          if (prev[key] != null && prev[key] !== '') {
            initializedRef.current.add(initKey);
            continue;
          }
          if (!changed) {
            next = { ...prev };
            changed = true;
          }
          next[key] = DEFAULT_NOTA_HISTORIAL;
          initializedRef.current.add(initKey);
        }
      }
      return changed ? next : prev;
    });
  }, [needsHistorial, materiasLoading, concludedPeriods, materiasByPeriod]);

  useEffect(() => {
    if (isEditMode && initialPriorHistories?.length) {
      setGradesByKey(seedGradesFromPriorEnrollmentHistories(initialPriorHistories));
      initializedRef.current = new Set(
        initialPriorHistories.map((h) =>
          historialPrevioRowKey(h.periodoId ?? h.periodId, h.materiaId ?? h.materia_id)
        )
      );
      return;
    }
    initializedRef.current.clear();
    setGradesByKey({});
  }, [tipoAdmision, selectedPeriodIds?.join(','), isEditMode, initialPriorHistories]);

  const setGrade = useCallback((key, value) => {
    setGradesByKey((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  const buildPayload = useCallback(
    () => buildPriorHistoryPayload(gradesByKey, concludedPeriods, materiasByPeriod),
    [gradesByKey, concludedPeriods, materiasByPeriod]
  );

  const validate = useCallback(
    () => validateHistorialPrevioGrades(gradesByKey, concludedPeriods, materiasByPeriod),
    [gradesByKey, concludedPeriods, materiasByPeriod]
  );

  return useMemo(
    () => ({
      needsHistorial,
      concludedPeriods,
      rows,
      gradesByKey,
      setGrade,
      buildPayload,
      validate,
      hasRows: rows.length > 0,
    }),
    [needsHistorial, concludedPeriods, rows, gradesByKey, setGrade, buildPayload, validate]
  );
};
