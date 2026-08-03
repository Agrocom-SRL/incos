import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

/**
 * Dominios del schema v2 (selector de grilla y sidebar).
 * REPORTES (módulo REP) queda fuera: el seeder 63-seed-permisos-rep.sql lo
 * desactiva por completo (activo=0) hasta que existan las pantallas; mostrarlo
 * aquí dejaría una pestaña vacía. Reincorporar cuando se reactive el seeder.
 */
export const DOMINIOS_V2 = [
  { value: 'MATRICULA', label: 'Matrícula', module: 'MAT' },
  { value: 'ACADEMICO', label: 'Académico', module: 'ACA' },
  { value: 'DOCENTES', label: 'Docentes', module: 'DOC' },
  { value: 'FINANZAS', label: 'Finanzas', module: 'FIN' },
  { value: 'INSTITUCIONAL', label: 'Institucional', module: 'INST' },
  { value: 'CAPACITACION', label: 'Capacitación', module: 'CAP' },
  // TITULACION agrupa los permisos de proyectos de grado y pasantías
  // (titulacion.*, rename 2026-07-31 desde TUTORIAS/tutorias.titulacion.*).
  // Acompañamiento (academico.acompanamiento.*) se siembra con dominio
  // ACADEMICO y aparece en esa pestaña (seed 59, decisión 2026-07-29).
  { value: 'TITULACION', label: 'Titulación', module: 'TIT' },
  { value: 'CONFIGURACION', label: 'Configuración', module: 'CFG' },
  { value: 'SEGURIDAD', label: 'Seguridad', module: 'SEG' },
];

export function usePermisosCatalogo() {
  const [permisosAgrupados, setPermisosAgrupados] = useState({});
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async (dominio) => {
    setLoading(true);
    try {
      const data = await useCasesFactory.listarPermisosAdmin().ejecutar(dominio);
      setPermisosAgrupados(data || {});
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { permisosAgrupados, loading, cargar, dominios: DOMINIOS_V2 };
}
