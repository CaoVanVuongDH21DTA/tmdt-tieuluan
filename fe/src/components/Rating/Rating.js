import { useMemo } from 'react'

const Star = ({ fillPercent = 0 }) => {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <defs>
        <linearGradient id={`grad-${fillPercent}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset={`${fillPercent}%`} stopColor="#facc15" />
          <stop offset={`${fillPercent}%`} stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#grad-${fillPercent})`}
        stroke="#d1d5db"
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24
           l-7.19-.61L12 2 9.19 8.63 2 9.24
           l5.46 4.73L5.82 21z"
      />
    </svg>
  );
};

const Rating = ({ rating }) => {
  const clampedRating = Math.max(0, Math.min(5, Number(rating) || 0));
  const fillPercent = useMemo(() => Math.round((clampedRating / 5) * 100), [clampedRating]);

  return (
    <div className="flex items-center" title={`Rating: ${clampedRating.toFixed(1)}/5`}>
      <Star fillPercent={fillPercent} />
      <p className="text-yellow-500 font-bold text-lg pl-2">{clampedRating.toFixed(1) || 0}</p>
    </div>
  );
};

export default Rating;
