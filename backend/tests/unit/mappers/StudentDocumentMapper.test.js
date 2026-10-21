import { StudentDocumentMapper } from '../../../src/infrastructure/mappers/StudentDocumentMapper.js';
import { StudentDocument } from '../../../src/domain/entities/StudentDocument.js';

describe('StudentDocumentMapper (infraestructura)', () => {
  const modelo = {
    id: 3,
    activo: true,
    estudianteId: 5,
    tipoDocumento: 'PAGO',
    documentacionId: 8,
    nombreArchivo: 'recibo.pdf',
    rutaArchivo: 'pagos/recibo.pdf',
    extension: 'pdf',
    tipoMime: 'application/pdf',
    contieneMultipleDocumentos: 0,
    verificado: 1,
    verificadoPor: 2,
    fechaVerificacion: '2026-03-01',
    observacionesVerificacion: 'ok',
    estado: 'APROBADO',
    motivoRechazo: null,
  };

  it('toEntity devuelve null sin modelo', () => {
    expect(StudentDocumentMapper.toEntity(undefined)).toBeNull();
  });

  it('toEntity convierte columnas a campos de dominio y normaliza booleanos', () => {
    const entity = StudentDocumentMapper.toEntity(modelo);
    expect(entity).toBeInstanceOf(StudentDocument);
    expect(entity).toMatchObject({
      id: 3,
      studentId: 5,
      tipoDocumento: 'PAGO',
      documentacionId: 8,
      fileName: 'recibo.pdf',
      filePath: 'pagos/recibo.pdf',
      extension: 'pdf',
      tipoMime: 'application/pdf',
      contieneMultipleDocumentos: false,
      verified: true,
      verifiedBy: 2,
      verificationDate: '2026-03-01',
      verificationObservations: 'ok',
      state: 'APROBADO',
      rejectionReason: null,
    });
  });

  it('toModel convierte a columnas con valores por defecto', () => {
    expect(StudentDocumentMapper.toModel({ studentId: 5, fileName: 'a.pdf', filePath: 'x/a.pdf' })).toEqual({
      estudianteId: 5,
      tipoDocumento: null,
      documentacionId: null,
      nombreArchivo: 'a.pdf',
      rutaArchivo: 'x/a.pdf',
      extension: null,
      tipoMime: null,
      contieneMultipleDocumentos: false,
      verificado: false,
      verificadoPor: null,
      fechaVerificacion: null,
      observacionesVerificacion: null,
      estado: 'PENDIENTE',
      motivoRechazo: null,
    });
  });

  it('toModel respeta los valores informados', () => {
    const m = StudentDocumentMapper.toModel({
      studentId: 5, fileName: 'a', filePath: 'b', verified: true, state: 'RECHAZADO', rejectionReason: 'borroso',
    });
    expect(m).toMatchObject({ verificado: true, estado: 'RECHAZADO', motivoRechazo: 'borroso' });
  });

  it('toModelForUpdate incluye solo lo enviado', () => {
    expect(StudentDocumentMapper.toModelForUpdate({ state: 'APROBADO', verified: true, verifiedBy: 4 }))
      .toEqual({ estado: 'APROBADO', verificado: true, verificadoPor: 4 });
    expect(StudentDocumentMapper.toModelForUpdate({ rejectionReason: '' }))
      .toEqual({ motivoRechazo: null });
    expect(StudentDocumentMapper.toModelForUpdate({})).toEqual({});
  });

  it('toEntityList filtra nulos y tolera entradas inválidas', () => {
    expect(StudentDocumentMapper.toEntityList([modelo, null])).toHaveLength(1);
    expect(StudentDocumentMapper.toEntityList(undefined)).toEqual([]);
  });
});
