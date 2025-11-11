-- Create storage bucket for car photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-photos',
  'car-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Policy: Anyone can view car photos (bucket is public)
CREATE POLICY "Car photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-photos');

-- Policy: Authenticated users can upload car photos
CREATE POLICY "Authenticated users can upload car photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'car-photos' AND
  auth.uid() IS NOT NULL
);

-- Policy: Authenticated users can update their uploaded photos
CREATE POLICY "Authenticated users can update car photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'car-photos' AND
  auth.uid() IS NOT NULL
);

-- Policy: Authenticated users can delete car photos
CREATE POLICY "Authenticated users can delete car photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'car-photos' AND
  auth.uid() IS NOT NULL
);