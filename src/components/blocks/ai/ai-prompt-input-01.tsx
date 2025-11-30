import React, { useRef, useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { FormulaIcon, SendIcon, CursorClickIcon } from "@/components/shared/PromptInput/icons";
import { PlusIcon } from "@/components/shared/SidebarItem/icons";
import { ContextChip } from "./ContextChip";
import { ImagePreview } from "./ImagePreview";
import { useSelectionContext } from "./SelectionContext";
import { useChatContext } from "@/components/blocks/chat/ChatContext";
import { getElementShortLabel } from "@/components/shared/2dPlan/lib/getElementShortLabel";
import { Calculator } from "./Calculator";
import styles from './ai-prompt-input-01.module.css';

export interface Ai01Props {
  mode?: 'editor' | 'chat';
}

interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
}

export default function Ai01({ mode = 'chat' }: Ai01Props) {
  const [message, setMessage] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    isSelectionMode, 
    selectedElements, 
    setSelectionMode, 
    removeElement 
  } = useSelectionContext();

  const { sendMessage } = useChatContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() || uploadedImages.length > 0) {
      // Получаем URL изображений
      const imageUrls = uploadedImages.map(img => img.previewUrl);
      
      // Отправляем сообщение через контекст
      sendMessage(message.trim(), imageUrls.length > 0 ? imageUrls : undefined);
      
      // Очищаем форму
      setMessage("");
      setUploadedImages([]);

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const isExpanded = message.length > 100 || message.includes('\n') || selectedElements.length > 0 || uploadedImages.length > 0;

  const handleSelectionModeToggle = () => {
    setSelectionMode(!isSelectionMode);
  };

  const handleRemoveElement = (elementId: string) => {
    removeElement(elementId);
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: UploadedImage[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const previewUrl = URL.createObjectURL(file);
        newImages.push({ id, file, previewUrl });
      }
    });

    setUploadedImages((prev) => [...prev, ...newImages]);
    e.target.value = ''; // Сбрасываем input для возможности повторной загрузки того же файла
  }, []);

  const handleRemoveImage = useCallback((imageId: string) => {
    setUploadedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter((img) => img.id !== imageId);
    });
  }, []);

  // Cleanup preview URLs on unmount
  React.useEffect(() => {
    return () => {
      uploadedImages.forEach((img) => {
        URL.revokeObjectURL(img.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-[800px] mx-auto">
      <form onSubmit={handleSubmit} className="w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className={styles.fileInput}
          aria-label="Загрузить изображение"
        />
        <div
          className={`flex w-full bg-white rounded-[24px] border border-[#d1d5dc] px-4 py-3 ${
            isExpanded ? 'flex-col gap-2' : 'items-center gap-3'
          }`}
          style={{ borderWidth: '0.897px' }}
        >
          {!isExpanded && (
            <button
              type="button"
              onClick={handleFileInputClick}
              className="flex-shrink-0 text-[#3f3f46] hover:text-gray-900 transition-colors p-1"
              aria-label="Добавить файл"
            >
              <PlusIcon />
            </button>
          )}

          <div className={`flex-1 min-w-0 ${isExpanded ? 'max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400' : ''}`}>
            {uploadedImages.length > 0 && (
              <div className={styles.imagePreviews}>
                {uploadedImages.map((image) => (
                  <ImagePreview
                    key={image.id}
                    file={image.file}
                    previewUrl={image.previewUrl}
                    onRemove={() => handleRemoveImage(image.id)}
                  />
                ))}
              </div>
            )}
            {selectedElements.length > 0 && (
              <div className={styles.contextChips}>
                {selectedElements.map((element) => (
                  <ContextChip
                    key={element.id}
                    elementId={element.id}
                    label={getElementShortLabel(element)}
                    onRemove={handleRemoveElement}
                  />
                ))}
              </div>
            )}
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={isSelectionMode ? "для добавления в контекст" : "Спросите что угодно"}
              className="min-h-0 resize-none rounded-none border-0 p-0 text-base bg-transparent text-gray-900 placeholder:text-[#99a1af] focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={1}
            />
          </div>

          <div className={`flex items-center gap-2 flex-shrink-0 ${isExpanded ? 'justify-end' : ''}`}>
            {isExpanded && (
              <button
                type="button"
                onClick={handleFileInputClick}
                className="flex-shrink-0 text-[#3f3f46] hover:text-gray-900 transition-colors p-1"
                aria-label="Добавить файл"
              >
                <PlusIcon />
              </button>
            )}

            {mode === 'editor' && (
              <button
                type="button"
                onClick={handleSelectionModeToggle}
                className={`${styles.selectionButton} ${isSelectionMode ? styles.active : ''} text-[#3f3f46] hover:text-gray-900 transition-colors p-1`}
                aria-label={isSelectionMode ? "Отключить режим выбора" : "Включить режим выбора"}
                title={isSelectionMode ? "Отключить режим выбора элементов" : "Включить режим выбора элементов"}
              >
                <CursorClickIcon />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCalculatorOpen(true)}
              className="text-[#3f3f46] hover:text-gray-900 transition-colors p-1"
              aria-label="Калькулятор"
            >
              <FormulaIcon />
            </button>

            {(message.trim() || uploadedImages.length > 0) && (
              <button
                type="submit"
                className="bg-black rounded-full flex items-center justify-center size-8 p-2 hover:opacity-80 transition-opacity"
                aria-label="Отправить"
              >
                <SendIcon />
              </button>
            )}
          </div>
        </div>
      </form>
      <Calculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
    </div>
  );
}
