import { put } from "@vercel/blob";

type UploadResult = {
  urls: string[];
};

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export async function uploadFilesToBlob(files: File[]): Promise<UploadResult> {
  try {
    const uploads = await Promise.all(
      files.map(async (file) => {
        const pathname = `notes/${Date.now()}-${sanitizeFileName(file.name)}`;
        const blob = await put(pathname, file, {
          access: "public",
          addRandomSuffix: true,
        });

        return blob.url;
      }),
    );

    return { urls: uploads };
  } catch (error) {
    console.error("Vercel Blob upload failed:", error);
    throw new Error("Failed to upload files. Please try again.");
  }
}
