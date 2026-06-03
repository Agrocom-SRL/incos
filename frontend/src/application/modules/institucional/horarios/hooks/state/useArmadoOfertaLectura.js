import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOfertaAcademicaApi } from '@application-institucional/oferta';
import { mapOfertaCursoToFilaCurso } from '../../mappers/plantillaOfertaMapper.js';

/**
 * Lectura de oferta_cursos para fusionar la grilla (sin CRUD de cursos; eso vive en Oferta académica).
 */
export function useArmadoOfertaLectura(paraleloGestionId) {
    const { fetchOfertaCursos } = useOfertaAcademicaApi();
    const [ofertaCursos, setOfertaCursos] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        const pgId = Number(paraleloGestionId);
        if (!Number.isFinite(pgId) || pgId < 1) {
            setOfertaCursos([]);
            return;
        }

        setLoading(true);
        const res = await fetchOfertaCursos(pgId);
        if (!res.success) {
            setOfertaCursos([]);
        } else {
            setOfertaCursos(res.data?.ofertaCursos ?? []);
        }
        setLoading(false);
    }, [fetchOfertaCursos, paraleloGestionId]);

    useEffect(() => {
        load();
    }, [load]);

    const filasOferta = useMemo(
        () => (ofertaCursos || []).map(mapOfertaCursoToFilaCurso),
        [ofertaCursos],
    );

    return { filasOferta, loading, refetchOferta: load };
}
