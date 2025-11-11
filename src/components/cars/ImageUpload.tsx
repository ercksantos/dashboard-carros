import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  label: string;
  images: string[];
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ label, images, onImagesChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Máximo de ${maxImages} fotos permitidas`);
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} excede o tamanho máximo de 5MB`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('car-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('car-photos')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      onImagesChange([...images, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} foto(s) enviada(s) com sucesso`);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload das fotos');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (index: number) => {
    const urlToRemove = images[index];
    
    try {
      // Extract file path from URL
      const urlParts = urlToRemove.split('/car-photos/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        
        const { error } = await supabase.storage
          .from('car-photos')
          .remove([filePath]);

        if (error) throw error;
      }

      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      toast.success('Foto removida com sucesso');
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      toast.error('Erro ao remover foto');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-xs text-muted-foreground">
          {images.length}/{maxImages} fotos
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((url, index) => (
          <Card key={index} className="relative aspect-video overflow-hidden group">
            <img
              src={url}
              alt={`Foto ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
              onClick={() => handleRemoveImage(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </Card>
        ))}

        {images.length < maxImages && (
          <label className="cursor-pointer">
            <Card className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary transition-colors">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground text-center px-2">
                    Adicionar fotos
                  </span>
                </>
              )}
            </Card>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Formatos aceitos: JPG, PNG, WEBP. Máximo 5MB por foto.
      </p>
    </div>
  );
}
