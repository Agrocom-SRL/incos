/**
 * URL de vista previa: archivo local (blob, instantáneo) o ruta guardada en servidor.
 */
import { useEffect, useState } from 'react';

export const useImageUploadPreviewUrl = (fileList, resolveStoredUrl) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const localFile = fileList?.[0]?.originFileObj;

  useEffect(() => {
    if (!(localFile instanceof File)) {
      setBlobUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(localFile);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [localFile]);

  if (blobUrl) {
    return blobUrl;
  }

  const stored = fileList?.[0]?.url;
  if (typeof stored === 'string' && stored) {
    return stored;
  }

  return resolveStoredUrl?.() ?? null;
};
