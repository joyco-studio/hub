"use client";
import { useState } from "react";
import { FileInputButton } from "@/registry/joyco/blocks/file-input-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Upload, FileText, Image as ImageIcon, Music, Video, File } from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export function FileInputButtonDemo() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleUpload = (file: File) => {
    setUploadedFiles((prev) => [
      ...prev,
      {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    ]);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith("audio/")) return <Music className="w-4 h-4" />;
    if (type.startsWith("video/")) return <Video className="w-4 h-4" />;
    if (type.startsWith("text/")) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Card className="not-prose">
      <CardContent>
        <div className="flex items-center justify-center mb-6">
          <FileInputButton 
            onUpload={handleUpload} 
            inputProps={{ multiple: true }}
            variant="default"
          >
            <Upload />
            Upload Files
          </FileInputButton>
          {uploadedFiles.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setUploadedFiles([])}
            >
              Clear All
            </Button>
          )}
        </div>
        
        {uploadedFiles.length > 0 ? (
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  "bg-fd-muted/50 border border-fd-border"
                )}
              >
                <div className="text-fd-muted-foreground">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-fd-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-fd-muted/50 border border-fd-border rounded-lg p-4 py-8 text-fd-muted-foreground text-sm">
            No files uploaded yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}

