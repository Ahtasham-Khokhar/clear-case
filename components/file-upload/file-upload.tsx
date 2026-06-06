"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface FileUploadProps {
  caseId?: string
  fileType?: string
  onUploadComplete?: (files: any[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
}

export function FileUpload({
  caseId,
  fileType = "evidence",
  onUploadComplete,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ["image/*", "application/pdf", ".doc", ".docx"],
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setErrors([])
      setUploading(true)
      setUploadProgress(0)

      const newErrors: string[] = []
      const successfulUploads: any[] = []

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]

        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          newErrors.push(`${file.name}: File size exceeds ${maxSize}MB`)
          continue
        }

        try {
          const result = await apiClient.uploadFile(file, caseId, fileType)
          successfulUploads.push(result.file)
          setUploadProgress(((i + 1) / acceptedFiles.length) * 100)
        } catch (error) {
          newErrors.push(`${file.name}: ${error instanceof Error ? error.message : "Upload failed"}`)
        }
      }

      setUploadedFiles((prev) => [...prev, ...successfulUploads])
      setErrors(newErrors)
      setUploading(false)
      setUploadProgress(0)

      if (onUploadComplete && successfulUploads.length > 0) {
        onUploadComplete(successfulUploads)
      }
    },
    [caseId, fileType, maxSize, onUploadComplete],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept: acceptedTypes.reduce(
      (acc, type) => {
        acc[type] = []
        return acc
      },
      {} as Record<string, string[]>,
    ),
  })

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Max {maxFiles} files, up to {maxSize}MB each
                </p>
                <p className="text-xs text-muted-foreground mt-1">Supported: Images, PDF, Word documents</p>
              </div>
            )}
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Uploading...</span>
                <span className="text-sm">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Upload Errors</span>
            </div>
            <ul className="text-sm text-destructive space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Uploaded Files</span>
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{file.file_type}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
