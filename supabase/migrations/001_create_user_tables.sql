ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_favorites (
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

CREATE TABLE public.user_ratings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  recipe_title TEXT,
  recipe_image TEXT,
  date_rated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

CREATE TABLE public.user_recently_viewed (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL,
  recipe_title TEXT NOT NULL,
  recipe_image TEXT,
  date_viewed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_recipe_id ON public.user_favorites(recipe_id);
CREATE INDEX idx_user_ratings_user_id ON public.user_ratings(user_id);
CREATE INDEX idx_user_ratings_recipe_id ON public.user_ratings(recipe_id);
CREATE INDEX idx_user_recently_viewed_user_id ON public.user_recently_viewed(user_id);
CREATE INDEX idx_user_recently_viewed_date ON public.user_recently_viewed(date_viewed DESC);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recently_viewed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
