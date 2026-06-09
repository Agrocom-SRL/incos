# Reporte de migracion (dump -> nuevo schema)

# oferta_cursos mapeados: 140
# estudiantes vivos: 384/402
# datos_academicos vivos: 384/402
# inscripciones vivas: 383/400
# matriculas vivas: 2919/3317
# pago_aporte vivos: 384/438
# becas vivas: 60/60
# catalogo estados_civiles: 6 ids seeded
# catalogo municipios: 365 ids seeded
# catalogo paises: 40 ids seeded
# catalogo idiomas: 22 ids seeded
# catalogo tipos_parentesco: 16 ids seeded
# catalogo tipos_discapacidad: 10 ids seeded
# catalogo carreras: 3 ids seeded
# catalogo gestiones: 6 ids seeded
# catalogo becas_descuentos: 12 ids seeded
# catalogo documentacion: 9 ids seeded
# catalogo asignaturas_plan: 82 ids seeded
# catalogo metodos_pago: 4 ids seeded
# catalogo cuentas_pago: 4 ids seeded
  -> 10-migrate-instituciones.sql: 6 filas
  -> 11-migrate-estudiantes.sql: 384 filas
  -> 12-migrate-estudiantes-datos-academicos.sql: 384 filas
  -> 13-migrate-estudiantes-origenes.sql: 384 filas
  -> 14-migrate-estudiantes-apoderados.sql: 312 filas
  -> 15-migrate-estudiantes-discapacidades.sql: 22 filas
  -> 16-migrate-estudiantes-becas.sql: 60 filas
  -> 17-migrate-estudiantes-documentos-entrega.sql: 1934 filas
  -> 18-migrate-documentos-estudiante.sql: 815 filas
  -> 19-migrate-inscripciones.sql: 383 filas
  -> 20-migrate-matriculas-materia.sql: 2919 filas
  ! matriculas sin resolver oferta: 0
  -> 21-migrate-pago-aporte.sql: 384 filas
  -> 22-migrate-pago-cuotas.sql: 398 filas
  -> 23-migrate-traspasos.sql: 3 filas
  -> 24-migrate-transitabilidades.sql: 3 filas
