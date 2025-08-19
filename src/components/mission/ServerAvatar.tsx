"use client";

import { useState, useEffect } from "react";

interface ServerAvatarProps {
  name: string;
  size?: string;
  useAI?: boolean;
  avatarPath?: string;
}

export function ServerAvatar({ name, size = "32", useAI = false, avatarPath }: ServerAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
    'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500'
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;

  useEffect(() => {
    if (!useAI) return;

    const generateImage = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/replicate/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Professional headshot portrait of a ${name.includes('Kim') ? 'Korean' : name.includes('Lee') ? 'Korean' : name.includes('Patel') ? 'Indian' : name.includes('Jones') ? 'African American' : 'diverse'} restaurant server named ${name}, professional lighting, high quality, realistic, 4k`
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.output && data.output[0]) {
            setImageUrl(data.output[0]);
          }
        }
      } catch (error) {
        console.error('Failed to generate image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateImage();
  }, [name, useAI]);

  if (isLoading) {
    return (
      <div className={`h-${size} w-${size} rounded-full bg-gray-200 flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  // Use local avatar image if provided
  if (avatarPath) {
    return (
      <img 
        src={avatarPath} 
        alt={`${name} profile`}
        className={`h-${size} w-${size} rounded-full object-cover border-2 border-white shadow-sm max-w-full max-h-full`}
        style={{ maxWidth: `${size}px`, maxHeight: `${size}px` }}
      />
    );
  }

  if (imageUrl) {
    return (
      <img 
        src={imageUrl} 
        alt={`${name} profile`}
        className={`h-${size} w-${size} rounded-full object-cover border-2 border-white shadow-sm max-w-full max-h-full`}
        style={{ maxWidth: `${size}px`, maxHeight: `${size}px` }}
      />
    );
  }

  return (
    <div className={`h-${size} w-${size} rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-semibold text-sm`}>
      {initials}
    </div>
  );
} 