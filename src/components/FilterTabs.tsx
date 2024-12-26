import { useState } from 'react';

interface FilterTabsProps {
  tags: string[];
  onTagSelect: (tag: string | null) => void;
}

export default function FilterTabs({ tags, onTagSelect }: FilterTabsProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleTagClick = (tag: string) => {
    const newTag = selectedTag === tag ? null : tag;
    setSelectedTag(newTag);
    onTagSelect(newTag);
  };

  return (
    <div className="flex overflow-x-auto py-2 px-4 gap-2 bg-white sticky top-0 z-10">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap
            ${selectedTag === tag 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700'
            }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
} 