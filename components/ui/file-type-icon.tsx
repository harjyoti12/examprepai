import { FileText, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";

function getStyle(type: string) {
  const t = type.toLowerCase();
  if (t === "pdf") return { icon: FileText, label: "PDF", className: "bg-red-500 text-white" };
  if (t === "png") return { icon: FileImage, label: "PNG", className: "bg-pink-500 text-white" };
  if (t === "jpg" || t === "jpeg" || t === "image")
    return { icon: FileImage, label: t === "jpeg" ? "JPG" : t.toUpperCase(), className: "bg-emerald-500 text-white" };
  return { icon: FileText, label: type.toUpperCase(), className: "bg-gray-500 text-white" };
}

export function FileTypeIcon({ fileType, title }: { fileType: string; title?: string }) {
  let type = fileType;
  if (title) {
    const ext = title.split(".").pop()?.toLowerCase();
    if (ext === "png") type = "png";
    else if (ext === "jpg" || ext === "jpeg") type = ext;
  }
  const { icon: Icon, label, className } = getStyle(type);

  return (
    <div className={cn("relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md", className)}>
      <Icon className="h-4.5 w-4.5" />
      <span className="absolute bottom-1 text-[8px] font-extrabold leading-none">{label}</span>
    </div>
  );
}
