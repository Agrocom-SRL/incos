import { agruparYCalcularPorBimestreMatricula } from './cuadernoNotasCalculo.js';

/**
 * Recalcula nota_teorico, nota_practico y nota_bimestre para todos los estudiantes del curso en un bimestre.
 */
export async function recalcularNotasBimestreCurso({
  cuadernoRepository,
  asignacionId,
  bimestreNumero,
  cuotaTeorico,
  cuotaPractico,
  usuarioId,
}) {
  const filas = await cuadernoRepository.listarFilasCalculoBimestre(
    Number(asignacionId),
    bimestreNumero,
  );
  const calculados = agruparYCalcularPorBimestreMatricula(filas);

  const todosBm = await cuadernoRepository.listarBimestresMatriculaIdsCurso(
    Number(asignacionId),
    bimestreNumero,
  );

  for (const bmId of todosBm) {
    const vals = calculados.get(bmId) ?? {
      teorico: null,
      practico: null,
      bimestre: null,
    };
    await cuadernoRepository.actualizarComponentesBimestreMatricula(bmId, vals, usuarioId);
  }

  return { estudiantesActualizados: todosBm.length };
}
