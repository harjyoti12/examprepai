import { z } from "zod";

const ACCEPTED_PDF_TYPES = ["application/pdf"];
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const MAX_IMAGE_FILES = 5;

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "Files cannot be empty.")
  .refine(
    (file) =>
      ACCEPTED_PDF_TYPES.includes(file.type) ||
      ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only PDF, JPG, JPEG, and PNG files are supported.",
  );

export const noteUploadSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required."),
    subject: z.string().trim().min(1, "Subject is required."),
    files: z.array(fileSchema).min(1, "Upload at least one file."),
  })
  .superRefine(({ files }, ctx) => {
    const pdfFiles = files.filter((file) => ACCEPTED_PDF_TYPES.includes(file.type));
    const imageFiles = files.filter((file) =>
      ACCEPTED_IMAGE_TYPES.includes(file.type),
    );

    if (pdfFiles.length > 0 && imageFiles.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["files"],
        message: "Upload either one PDF or up to 5 images, not both.",
      });
      return;
    }

    if (pdfFiles.length > 1) {
      ctx.addIssue({
        code: "custom",
        path: ["files"],
        message: "Only one PDF file is allowed.",
      });
    }

    if (imageFiles.length > MAX_IMAGE_FILES) {
      ctx.addIssue({
        code: "custom",
        path: ["files"],
        message: `Upload a maximum of ${MAX_IMAGE_FILES} images.`,
      });
    }
  });

export type NoteUploadInput = z.infer<typeof noteUploadSchema>;

export function getUploadFileType(files: File[]) {
  return files[0]?.type === "application/pdf" ? "pdf" : "image";
}
