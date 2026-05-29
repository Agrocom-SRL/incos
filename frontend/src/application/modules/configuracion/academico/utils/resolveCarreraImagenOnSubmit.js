/**
 * Si hay archivo nuevo en imagenArchivo, sube al servidor y devuelve imagenRuta.
 */
export const resolveCarreraImagenOnSubmit = async (values, subirCarreraImagenUseCase) => {
  const fileList = values?.imagenArchivo;
  const file = fileList?.[0]?.originFileObj;
  if (!file || !(file instanceof File)) {
    return values?.imagenRuta?.trim() || undefined;
  }

  const codigo = values?.codigo?.trim();
  if (!codigo) {
    throw new Error('Ingrese el código de la carrera antes de subir la imagen');
  }

  const result = await subirCarreraImagenUseCase.ejecutar(codigo, file);
  if (!result?.success) {
    throw new Error(result?.error || 'No se pudo subir la imagen');
  }
  return result.data?.imagenRuta;
};
