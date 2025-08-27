import { supabase } from '../supabase';

const getCurrentUserId = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user?.id || null;
  } catch (error) {
    console.error('Error in getCurrentUserId:', error);
    return null;
  }
};

const parseRecipeId = (value) => {
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) ? id : null;
};

export async function getUserFavorites(userId = null) {
  try {
    const userIdToUse = userId || await getCurrentUserId();
    if (!userIdToUse) return [];

    const { data, error } = await supabase
      .from('user_favorites')
      .select('id, recipe_id, recipe_title, recipe_image, initial_rating, initial_reviews, date_added')
      .eq('user_id', userIdToUse)
      .order('date_added', { ascending: false });

    if (error) throw error;
    const mapped = (data || []).map((row) => ({
      id: row.recipe_id,
      title: row.recipe_title,
      image: row.recipe_image,
      initialRating: row.initial_rating || 0,
      initialReviews: row.initial_reviews || 0,
      dateAdded: row.date_added
    }));
    return mapped;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

export async function addToFavorites(recipe) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    const recipeIdInt = parseRecipeId(recipe.id);
    if (recipeIdInt === null) throw new Error('Invalid recipe ID');

    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        recipe_id: recipeIdInt,
        recipe_title: recipe.title,
        recipe_image: recipe.image,
        initial_rating: recipe.initialRating || 0,
        initial_reviews: recipe.initialReviews || 0
      })
      .select();

    if (error) throw error;
    return await getUserFavorites(userId);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
}

export async function removeFromFavorites(recipeId) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    const recipeIdInt = parseRecipeId(recipeId);
    if (recipeIdInt === null) throw new Error('Invalid recipe ID');

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeIdInt);

    if (error) throw error;
    return await getUserFavorites(userId);
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
}

export async function isRecipeFavorited(recipeId) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;
    const recipeIdInt = parseRecipeId(recipeId);
    if (recipeIdInt === null) return false;

    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('recipe_id', recipeIdInt)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking if favorited:', error);
    return false;
  }
}

export async function setRecipeRating(recipeId, rating, recipeTitle = '', recipeImage = '') {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    const recipeIdInt = parseRecipeId(recipeId);
    if (recipeIdInt === null) throw new Error('Invalid recipe ID');

    const { data: existing, error: fetchError } = await supabase
      .from('user_ratings')
      .select('id')
      .eq('user_id', userId)
      .eq('recipe_id', recipeIdInt)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (rating === 0) {
      if (existing?.id) {
        const { error: delError } = await supabase
          .from('user_ratings')
          .delete()
          .eq('user_id', userId)
          .eq('recipe_id', recipeIdInt);
        if (delError) throw delError;
      }
    } else if (existing?.id) {
      const { error: updError } = await supabase
        .from('user_ratings')
        .update({ rating, recipe_title: recipeTitle, recipe_image: recipeImage })
        .eq('id', existing.id);
      if (updError) throw updError;
    } else {
      const { error: insError } = await supabase
        .from('user_ratings')
        .insert({
          user_id: userId,
          recipe_id: recipeIdInt,
          rating,
          recipe_title: recipeTitle,
          recipe_image: recipeImage
        });
      if (insError) throw insError;
    }

    return await getUserRatings(userId);
  } catch (error) {
    console.error('Error setting rating:', error?.message || error);
    if (error?.code === '23514') {
      throw new Error('Rating must be between 0 and 5');
    } else if (error?.code === '42501') {
      throw new Error('You do not have permission to rate this recipe');
    } else if (error?.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to save rating. Please try again.');
    }
  }
}

export async function getRecipeRating(recipeId) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return 0;
    const recipeIdInt = parseRecipeId(recipeId);
    if (recipeIdInt === null) return 0;

    const { data, error } = await supabase
      .from('user_ratings')
      .select('rating')
      .eq('user_id', userId)
      .eq('recipe_id', recipeIdInt)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.rating || 0;
  } catch (error) {
    console.error('Error getting rating:', error);
    return 0;
  }
}

export async function getUserRatings(userId = null) {
  try {
    const userIdToUse = userId || await getCurrentUserId();
    if (!userIdToUse) return [];

    const { data, error } = await supabase
      .from('user_ratings')
      .select('*')
      .eq('user_id', userIdToUse)
      .order('date_rated', { ascending: false });

    if (error) throw error;
    const mapped = (data || []).map((row) => ({
      id: row.recipe_id,
      title: row.recipe_title,
      image: row.recipe_image,
      rating: row.rating,
      dateRated: row.date_rated
    }));
    return mapped;
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }
}

export async function addToRecentlyViewed(recipe) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;
    const recipeIdInt = parseRecipeId(recipe.id);
    if (recipeIdInt === null) return;

    await supabase
      .from('user_recently_viewed')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeIdInt);

    const { error } = await supabase
      .from('user_recently_viewed')
      .insert({
        user_id: userId,
        recipe_id: recipeIdInt,
        recipe_title: recipe.title,
        recipe_image: recipe.image
      });

    if (error) throw error;

    const { data: allViewed } = await supabase
      .from('user_recently_viewed')
      .select('id')
      .eq('user_id', userId)
      .order('date_viewed', { ascending: false });

    if (allViewed && allViewed.length > 10) {
      const idsToDelete = allViewed.slice(10).map(item => item.id);
      await supabase
        .from('user_recently_viewed')
        .delete()
        .in('id', idsToDelete);
    }

    return await getRecentlyViewed(userId);
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
    return [];
  }
}

export async function getRecentlyViewed(userId = null) {
  try {
    const userIdToUse = userId || await getCurrentUserId();
    if (!userIdToUse) return [];

    const { data, error } = await supabase
      .from('user_recently_viewed')
      .select('id, recipe_id, recipe_title, recipe_image, date_viewed')
      .eq('user_id', userIdToUse)
      .order('date_viewed', { ascending: false })
      .limit(10);

    if (error) throw error;
    const mapped = (data || []).map((row) => ({
      id: row.recipe_id,
      title: row.recipe_title,
      image: row.recipe_image,
      dateViewed: row.date_viewed
    }));
    return mapped;
  } catch (error) {
    console.error('Error fetching recently viewed:', error);
    return [];
  }
}

export async function clearAllUserData() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;
      await Promise.all([
      supabase.from('user_favorites').delete().eq('user_id', userId),
      supabase.from('user_ratings').delete().eq('user_id', userId),
      supabase.from('user_recently_viewed').delete().eq('user_id', userId)
    ]);

    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
}
