DROP POLICY IF EXISTS "Users can view their own ratings" ON public.user_ratings;
DROP POLICY IF EXISTS "Users can insert their own ratings" ON public.user_ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.user_ratings;
DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.user_ratings;

DROP POLICY IF EXISTS "Users can view their own recently viewed" ON public.user_recently_viewed;
DROP POLICY IF EXISTS "Users can insert their own recently viewed" ON public.user_recently_viewed;
DROP POLICY IF EXISTS "Users can delete their own recently viewed" ON public.user_recently_viewed;

CREATE POLICY "Enable read access for authenticated users on their own ratings" 
ON public.user_ratings FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for authenticated users on their own ratings" 
ON public.user_ratings FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for authenticated users on their own ratings" 
ON public.user_ratings FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for authenticated users on their own ratings" 
ON public.user_ratings FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for authenticated users on their own recently viewed" 
ON public.user_recently_viewed FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for authenticated users on their own recently viewed" 
ON public.user_recently_viewed FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for authenticated users on their own recently viewed" 
ON public.user_recently_viewed FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recently_viewed ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_ratings TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_recently_viewed TO authenticated;
GRANT USAGE ON SEQUENCE public.user_ratings_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.user_recently_viewed_id_seq TO authenticated;
