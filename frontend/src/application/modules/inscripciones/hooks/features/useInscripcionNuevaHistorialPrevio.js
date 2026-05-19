/**
 * Hook: historial de notas en el wizard de inscripción.
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
  seedHistorialFromPriorEnrollmentHistories,
  resolveRowStatus,
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
  const initialSeed = useMemo(
    () => seedHistorialFromPriorEnrollmentHistories(initialPriorHistories),
    [initialPriorHistories]
  );

  const [gradesByKey, setGradesByKey] = useState(() => initialSeed.gradesByKey);
  const [statusByKey, setStatusByKey] = useState(() => initialSeed.statusByKey);
  const [invalidGradeKeys, setInvalidGradeKeys] = useState([]);
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
    () => buildHistorialPrevioRows(concludedPeriods, materiasByPeriod, gradesByKey, statusByKey),
    [concludedPeriods, materiasByPeriod, gradesByKey, statusByKey]
  );

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

          const status = resolveRowStatus(statusByKey, key, period.status);
          if (status !== 'APROBADO') {
            initializedRef.current.add(initKey);
            continue;
          }

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
  }, [needsHistorial, materiasLoading, concludedPeriods, materiasByPeriod, statusByKey]);

  useEffect(() => {
    if (!needsHistorial || concludedPeriods.length === 0) return;

    setStatusByKey((prev) => {
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
          if (prev[key] != null) continue;
          if (!changed) {
            next = { ...prev };
            changed = true;
          }
          next[key] = resolveRowStatus(prev, key, period.status);
        }
      }
      return changed ? next : prev;
    });
  }, [needsHistorial, concludedPeriods, materiasByPeriod]);

  useEffect(() => {
    if (isEditMode && initialPriorHistories?.length) {
      const seed = seedHistorialFromPriorEnrollmentHistories(initialPriorHistories);
      setGradesByKey(seed.gradesByKey);
      setStatusByKey(seed.statusByKey);
      initializedRef.current = new Set(
        initialPriorHistories.map((h) =>
          historialPrevioRowKey(h.periodoId ?? h.periodId, h.materiaId ?? h.materia_id)
        )
      );
      return;
    }
    initializedRef.current.clear();
    setGradesByKey({});
    setStatusByKey({});
  }, [tipoAdmision, selectedPeriodIds?.join(','), isEditMode, initialPriorHistories]);

  const setGrade = useCallback((key, value) => {
    setInvalidGradeKeys((prev) => (prev.length ? prev.filter((k) => k !== key) : prev));
    setGradesByKey((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  const setStatus = useCallback((key, value) => {
    const status = String(value).toUpperCase() === 'CONVALIDADO' ? 'CONVALIDADO' : 'APROBADO';
    setStatusByKey((prev) => {
      if (prev[key] === status) return prev;
      return { ...prev, [key]: status };
    });
    if (status === 'CONVALIDADO') {
      setGradesByKey((prev) => {
        if (prev[key] == null) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      setGradesByKey((prev) => {
        if (prev[key] != null && prev[key] !== '') return prev;
        return { ...prev, [key]: DEFAULT_NOTA_HISTORIAL };
      });
    }
  }, []);

  const buildPayload = useCallback(
    () => buildPriorHistoryPayload(gradesByKey, statusByKey, concludedPeriods, materiasByPeriod),
    [gradesByKey, statusByKey, concludedPeriods, materiasByPeriod]
  );

  const validate = useCallback(() => {
    const result = validateHistorialPrevioGrades(
      gradesByKey,
      statusByKey,
      concludedPeriods,
      materiasByPeriod,
    );
    setInvalidGradeKeys(result.valid ? [] : result.invalidKeys ?? []);
    return result;
  }, [gradesByKey, statusByKey, concludedPeriods, materiasByPeriod]);

  return useMemo(
    () => ({
      needsHistorial,
      tipoAdmision,
      concludedPeriods,
      rows,
      gradesByKey,
      statusByKey,
      setGrade,
      setStatus,
      buildPayload,
      validate,
      invalidGradeKeys,
      hasRows: rows.length > 0,
      materiasLoading,
    }),
    [
      needsHistorial,
      tipoAdmision,
      concludedPeriods,
      rows,
      gradesByKey,
      statusByKey,
      setGrade,
      setStatus,
      buildPayload,
      validate,
      invalidGradeKeys,
      materiasLoading,
    ]
  );
};
