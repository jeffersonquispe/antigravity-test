import { supabase } from './supabase';
import { Swipe } from '../types/swipe.types';

export const swipeService = {
  async recordSwipe(swipe: Omit<Swipe, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('swipes')
      .insert([swipe])
      .select();

    if (error) {
      console.error('Error recording swipe:', error);
      throw error;
    }

    return data;
  },

  async getSwipeHistory(userId: string) {
    const { data, error } = await supabase
      .from('swipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching swipe history:', error);
      throw error;
    }

    return data as Swipe[];
  }
};
