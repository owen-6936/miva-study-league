import * as React from 'react';
import { motion } from 'motion/react';
import { UploadCloud, X, File, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Progress } from './progress';

export interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = 'image/png, image/jpeg, application/pdf',
  maxSizeMB = 10,
  className,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (f: File): boolean => {
    setError(null);
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return false;
    }
    // Simple extension check could be added here based on 'accept' prop
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile as File)) {
        setFile(droppedFile as File);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile as File)) {
        setFile(selectedFile as File);
      }
    }
  };

  const startUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 10;
      });
    }, 100);

    try {
      await onUpload(file);
      setProgress(100);
      setTimeout(() => {
        setFile(null);
        setProgress(0);
      }, 1000);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      clearInterval(interval);
      setIsUploading(false);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200',
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-surface',
            error && 'border-red-500 bg-red-500/5',
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
          <UploadCloud
            className={cn(
              'w-10 h-10 mb-4',
              isDragging ? 'text-primary' : 'text-text/50',
              error && 'text-red-500',
            )}
          />
          <p className="text-sm font-medium mb-1">Drag & drop file here, or click to browse</p>
          <p className="text-xs text-text/50">
            Supports {accept} up to {maxSizeMB}MB
          </p>

          {error && (
            <div className="mt-4 flex items-center text-red-500 text-xs bg-red-500/10 px-3 py-1.5 rounded-md">
              <AlertCircle className="w-3 h-3 mr-1.5" />
              {error}
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-border rounded-xl p-4 bg-bg-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center overflow-hidden">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <File className="w-6 h-6 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-text/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            {!isUploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {isUploading ? (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-center text-text/60">{progress}% uploaded</p>
            </div>
          ) : (
            <Button onClick={startUpload} className="w-full" size="sm">
              Upload File
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};
