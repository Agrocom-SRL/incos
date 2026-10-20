import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocumentacionProcesada } from '../useDocumentacionProcesada';

const docs = [
  { id: 1, nombre: 'Cédula', requerido: true, orden: 1 },
  { id: 2, nombre: 'Foto', requerido: false, orden: 2 },
  { id: 3, nombre: 'Sistema', requerido: true, orden: 3, esDocumentoSistema: true },
];

describe('useDocumentacionProcesada', () => {
  it('excluye documentos de sistema y separa requeridos/opcionales', () => {
    const { result } = renderHook(() => useDocumentacionProcesada(docs));
    expect(result.current.cantidadDocumentos).toBe(2);
    expect(result.current.cantidadRequeridos).toBe(1);
    expect(result.current.cantidadOpcionales).toBe(1);
    expect(result.current.documentosRequeridos[0].name).toBe('Cédula');
  });

  // Regresión: el useRef original estabilizaba por valor; el useMemo debe seguir haciéndolo.
  it('mantiene la referencia entre renders mientras la documentación no cambia', () => {
    const { result, rerender } = renderHook(({ d }) => useDocumentacionProcesada(d), {
      initialProps: { d: docs },
    });
    const first = result.current;
    rerender({ d: docs });
    expect(result.current).toBe(first);
  });

  it('devuelve un resultado nuevo cuando cambia la documentación', () => {
    const { result, rerender } = renderHook(({ d }) => useDocumentacionProcesada(d), {
      initialProps: { d: docs },
    });
    const first = result.current;
    rerender({ d: [...docs, { id: 4, nombre: 'Título', requerido: true, orden: 4 }] });
    expect(result.current).not.toBe(first);
    expect(result.current.cantidadDocumentos).toBe(3);
  });
});
