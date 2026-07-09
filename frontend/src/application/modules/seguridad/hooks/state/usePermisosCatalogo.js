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
