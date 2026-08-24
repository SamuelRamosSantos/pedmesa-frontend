import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, MouseEvent } from "react";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { uploadImagem } from "../../services/upload.service";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  shape?: "square" | "circle";
}

function validarArquivo(file: File): string | null {
  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return "Envie um arquivo JPG, PNG ou WEBP.";
  }

  if (file.size > TAMANHO_MAXIMO_BYTES) {
    return "O arquivo deve ter no máximo 5MB.";
  }

  return null;
}

export function ImageUpload({ value, onChange, label, shape = "square" }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const imagemExibida = previewUrl ?? value;

  async function handleFile(file: File) {
    const erro = validarArquivo(file);

    if (erro) {
      showToast(erro, "error");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      const { url } = await uploadImagem(file);
      onChange(url);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível enviar a imagem. Tente novamente."), "error");
    } finally {
      setIsUploading(false);
      setPreviewUrl(null);
      URL.revokeObjectURL(objectUrl);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    event.target.value = "";
  }

  function handleRemove(event: MouseEvent) {
    event.stopPropagation();
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>}

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        className={`relative flex cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed transition-colors ${
          shape === "circle" ? "h-24 w-24 rounded-full" : "h-32 w-full rounded-xl"
        } ${
          isDragging
            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
            : "border-slate-300 bg-slate-50 hover:border-orange-400 dark:border-slate-700 dark:bg-slate-800"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleInputChange}
        />

        {imagemExibida ? (
          <>
            <img src={imagemExibida} alt="" className="h-full w-full object-cover" />
            {!isUploading && (
              <button
                type="button"
                onClick={handleRemove}
                aria-label="Remover imagem"
                className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 px-3 text-center text-slate-400 dark:text-slate-500">
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs">Arraste uma imagem ou clique para selecionar</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500">JPG, PNG ou WEBP · máx. 5MB</p>
    </div>
  );
}
