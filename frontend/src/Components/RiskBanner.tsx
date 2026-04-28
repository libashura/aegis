'use client';

interface RiskBannerProps {
  score: number | null;
}

export default function RiskBanner({ score }: RiskBannerProps) {
  if (score === null || score === undefined) {
    return null;
  }

  let riskLevel = 'LOW';
  let bgColor = 'bg-green-900';
  let textColor = 'text-green-200';

  if (score >= 75) {
    riskLevel = 'CRITICAL';
    bgColor = 'bg-red-900';
    textColor = 'text-red-200';
  } else if (score >= 50) {
    riskLevel = 'HIGH';
    bgColor = 'bg-orange-900';
    textColor = 'text-orange-200';
  } else if (score >= 25) {
    riskLevel = 'MEDIUM';
    bgColor = 'bg-yellow-900';
    textColor = 'text-yellow-200';
  }

  return (
    <div className={`w-full ${bgColor} ${textColor} py-3 px-6 rounded-lg text-center font-semibold text-lg`}>
      Risk Level: <span className="uppercase">{riskLevel}</span> ({score.toFixed(0)}/100)
    </div>
  );
}
