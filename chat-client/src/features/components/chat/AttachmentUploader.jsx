export const AttachmentUploader = ({
  selectedFile,
  onFileSelect,
  inputKey,
  disabled = false,
}) => (
  <div className="flex min-w-0 items-center gap-2">
    <input
      key={inputKey}
      type="file"
      accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,application/pdf"
      onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
      disabled={disabled}
      className="cursor-pointer min-w-0 flex-1 text-sm text-gray-300"
    />

    {selectedFile && (
      <span className="max-w-32 truncate text-xs text-gray-300">
        {selectedFile.name}
      </span>
    )}
  </div>
);