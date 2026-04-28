'use client';

interface ScoreBadgeProps {
  score: number | null;
  label: string;
  max?: number;
}

export default function ScoreBadge({
  score,
  label,
  max = 100,
}: ScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <div className="flex flex-col items-center p-3 bg-gray-800 rounded-lg">
        <span className="text-gray-500 text-sm">{label}</span>
        <span className="text-gray-600 font-semibold text-lg">N/A</span>
      </div>
    );
  }

  const percentage = (score / max) * 100;
  let bgColor = 'bg-green-900';
  let textColor = 'text-green-400';
  let borderColor = 'border-green-700';

  if (percentage >= 75) {
    bgColor = 'bg-red-900';
    textColor = 'text-red-400';
    borderColor = 'border-red-700';
  } else if (percentage >= 50) {
    bgColor = 'bg-yellow-900';
    textColor = 'text-yellow-400';
    borderColor = 'border-yellow-700';
  }

  return (
    <div className={`flex flex-col items-center p-3 ${bgColor} rounded-lg border ${borderColor}`}>
      <span className="text-gray-300 text-sm">{label}</span>
      <span className={`${textColor} font-semibold text-lg`}>
        {score.toFixed(0)}
      </span>
    </div>
  );
}
