export type SwipeType = 'like' | 'dislike';

export interface Swipe {
  id?: string;
  user_id: string;
  movie_id: number;
  movie_title: string;
  movie_poster_url: string | null;
  swipe_type: SwipeType;
  created_at?: string;
}
