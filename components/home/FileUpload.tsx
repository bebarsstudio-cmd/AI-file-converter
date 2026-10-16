"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, FileCode, X, Folder } from "lucide-react";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export default function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    onFilesChange([...files, ...Array.from(newFiles)]);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div id="file-upload" className="animate-in-up glass rounded-2xl p-4 md:p-6">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging 
            ? "border-purple-500 bg-purple-500/10" 
            : "border-white/10 hover:border-white/20 hover:bg-white/5"
        }`}
      >
        <Upload className={`mx-auto mb-3 ${isDragging ? "text-purple-400" : "text-gray-500"}`} size={32} />
        <p className="text-gray-300 font-medium">Drag & drop your project files here</p>
        <p className="text-gray-500 text-sm mt-1">or click to browse (ZIP, folders, or multiple files)</p>
        
        <input 
          ref={fileInputRef} 
          type="file" 
          multiple 
          className="hidden" 
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }} 
        />
        <input 
          ref={folderInputRef} 
          type="file" 
          // @ts-expect-error - webkitdirectory is not in standard TS types but works in browsers
          webkitdirectory="" 
          directory="" 
          multiple 
          className="hidden" 
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }} 
        />
      </div>

      <div className="flex gap-3 mt-4">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 text-sm text-gray-300 transition-colors"
        >
          <FileCode size={16} /> Select Files
        </button>
        <button 
          onClick={() => folderInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 text-sm text-gray-300 transition-colors"
        >
          <Folder size={16} /> Select Folder
        </button>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-2 truncate">
                <FileCode size={14} className="text-purple-400 flex-shrink-0" />
                <span className="text-gray-300 truncate">{file.name}</span>
                <span className="text-gray-500 text-xs flex-shrink-0">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button 
                onClick={() => removeFile(index)}
                className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0 ml-2"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
