CREATE TABLE IF NOT EXISTS public.user_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL,
  recipe_title TEXT NOT NULL,
  recipe_image TEXT,
  initial_rating INTEGER DEFAULT 0,
  initial_reviews INTEGER DEFAULT 0,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS public.user_ratings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
  recipe_title TEXT,
  recipe_image TEXT,
  date_rated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS public.user_recently_viewed (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL,
  recipe_title TEXT NOT NULL,
  recipe_image TEXT,
  date_viewed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_recipe_id ON public.user_favorites(recipe_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON public.user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_recipe_id ON public.user_ratings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_user_recently_viewed_user_id ON public.user_recently_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recently_viewed_date ON public.user_recently_viewed(date_viewed DESC);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recently_viewed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can update their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

DROP POLICY IF EXISTS "Users can view their own ratings" ON public.user_ratings;
DROP POLICY IF EXISTS "Users can insert their own ratings" ON public.user_ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.user_ratings;
DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.user_ratings;

DROP POLICY IF EXISTS "Users can view their own recently viewed" ON public.user_recently_viewed;
DROP POLICY IF EXISTS "Users can insert their own recently viewed" ON public.user_recently_viewed;
DROP POLICY IF EXISTS "Users can delete their own recently viewed" ON public.user_recently_viewed;

CREATE POLICY "Users can view their own favorites" ON public.user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON public.user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" ON public.user_favorites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.user_favorites
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own ratings" ON public.user_ratings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ratings" ON public.user_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON public.user_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" ON public.user_ratings
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own recently viewed" ON public.user_recently_viewed
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recently viewed" ON public.user_recently_viewed
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recently viewed" ON public.user_recently_viewed
  FOR DELETE USING (auth.uid() = user_id);
