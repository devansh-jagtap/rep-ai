"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUploadComplete: (result: { fileUrl: string; fileName: string; mimeType: string; fileSize: number }) => void;
  disabled?: boolean;
}

export function FileUpload({ onUploadComplete, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadUrlResponse = await fetch(
        `/api/knowledge/upload?fileName=${encodeURIComponent(file.name)}&mimeType=${encodeURIComponent(file.type)}`,
        { method: "POST" }
      );

      if (!uploadUrlResponse.ok) {
        const errorData = await uploadUrlResponse.json();
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const { uploadUrl, publicUrl } = await uploadUrlResponse.json();

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText || xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error. Check S3 CORS configuration."));
        xhr.send(file);
      });

      onUploadComplete({
        fileUrl: publicUrl,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });
      
      setUploadProgress(0);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag and drop a PDF here, or click to select
            </p>
            <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

interface UploadedFilePreviewProps {
  fileName: string;
  fileSize: number;
  status?: "uploading" | "ready" | "error";
  onRemove?: () => void;
}

export function UploadedFilePreview({ fileName, fileSize, status, onRemove }: UploadedFilePreviewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
      <FileText className="h-8 w-8 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fileName}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
      </div>
      {status === "uploading" && <Loader2 className="h-4 w-4 animate-spin" />}
      {status === "ready" && <CheckCircle className="h-4 w-4 text-green-500" />}
      {onRemove && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
