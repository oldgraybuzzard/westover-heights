import React, { useState, useEffect } from 'react';
import { FaVideo } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

interface VideoPost {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  publishedAt: string;
}

const VideoBlogPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [videoPosts, setVideoPosts] = useState<VideoPost[]>([]);

  useEffect(() => {
    fetchVideoPosts();
  }, []);

  const fetchVideoPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('video_posts')
        .select('*')
        .order('publishedAt', { ascending: false });

      if (error) throw error;
      setVideoPosts(data || []);
    } catch (error) {
      console.error('Error fetching video posts:', error);
      toast.error('Failed to load videos');
    }
  };

  const handleAddVideo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const { error } = await supabase
        .from('video_posts')
        .insert({
          title: formData.get('title'),
          youtubeId: formData.get('youtubeId'),
          description: formData.get('description'),
          publishedAt: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Video added successfully');
      form.reset();
      fetchVideoPosts();
    } catch (error) {
      console.error('Error adding video:', error);
      toast.error('Failed to add video');
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 pt-16 animate-fade-in">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Video Blog</h1>
      
      {isAdmin() && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Video</h2>
          <form onSubmit={handleAddVideo} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="youtubeId" className="block text-sm font-medium text-gray-700">
                YouTube Video ID
              </label>
              <input
                type="text"
                id="youtubeId"
                name="youtubeId"
                placeholder="e.g., dQw4w9WgXcQ"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <FaVideo className="mr-2" />
              Add Video
            </button>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {videoPosts.map((post: VideoPost) => (
          <article key={post.id} className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{post.title}</h2>
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100 mb-4">
              <iframe
                src={`https://www.youtube.com/embed/${post.youtubeId}`}
                title={post.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="prose max-w-none text-gray-700">
              <p>{post.description}</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};

export default VideoBlogPage;
