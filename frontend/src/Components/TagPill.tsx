'use client';

interface TagPillProps {
  tag: string;
}

export default function TagPill({ tag }: TagPillProps) {
  const tagLower = tag.toLowerCase();
  let bgColor = 'bg-gray-700';
  let textColor = 'text-gray-100';

  if (tagLower.includes('tor')) {
    bgColor = 'bg-purple-900';
    textColor = 'text-purple-200';
  } else if (tagLower.includes('vpn')) {
    bgColor = 'bg-blue-900';
    textColor = 'text-blue-200';
  } else if (tagLower.includes('proxy')) {
    bgColor = 'bg-orange-900';
    textColor = 'text-orange-200';
  } else if (tagLower.includes('abuse') || tagLower.includes('malware')) {
    bgColor = 'bg-red-900';
    textColor = 'text-red-200';
  }

  return (
    <span
      className={`inline-block ${bgColor} ${textColor} px-3 py-1 rounded-full text-sm font-medium`}
    >
      {tag}
    </span>
  );
}
