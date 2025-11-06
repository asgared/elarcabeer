"use client";

import { useCallback, useState } from "react";

type UploadOptions = {
  folder?: string;
};

type UploadResult = {
  url: string;
  publicId?: string;
};

export function useCloudinaryUpload(options: UploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (files: File[]): Promise<UploadResult[]> => {
      if (files.length === 0) {
        return [];
      }

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error(
          "La configuración pública de Cloudinary no está disponible. Verifica las variables de entorno.",
        );
      }

      setIsUploading(true);

      try {
        const results: UploadResult[] = [];

        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", uploadPreset);

          if (options.folder) {
            formData.append("folder", options.folder);
          }

          const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
          const response = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (!response.ok || typeof data.secure_url !== "string") {
            throw new Error("No se pudo subir la imagen a Cloudinary.");
          }

          results.push({ url: data.secure_url as string, publicId: data.public_id });
        }

        return results;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudieron subir los archivos. Inténtalo nuevamente.";

        throw error instanceof Error ? error : new Error(message);
      } finally {
        setIsUploading(false);
      }
    },
    [options.folder],
  );

  return { upload, isUploading };
}
