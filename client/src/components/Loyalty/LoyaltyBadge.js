import React from 'react';
import { useLoyalty } from '../../contexts/LoyaltyContext';
import { 
  StarIcon, 
  SparklesIcon, 
  GiftIcon,
  TrophyIcon 
} from '@heroicons/react/24/outline';

const LoyaltyBadge = () => {
  const { points, level, nextReward, getLevelBenefits } = useLoyalty();
  const benefits = getLevelBenefits(level);

  const getLevelColor = (level) => {
    switch (level) {
      case 'Diamond':
        return 'from-purple-500 to-pink-500';
      case 'Platinum':
        return 'from-gray-400 to-gray-600';
      case 'Gold':
        return 'from-yellow-400 to-orange-500';
      case 'Silver':
        return 'from-gray-300 to-gray-500';
      default:
        return 'from-amber-600 to-orange-700';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'Diamond':
        return <SparklesIcon className="h-4 w-4" />;
      case 'Platinum':
        return <TrophyIcon className="h-4 w-4" />;
      case 'Gold':
        return <StarIcon className="h-4 w-4" />;
      case 'Silver':
        return <StarIcon className="h-4 w-4" />;
      default:
        return <GiftIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-6 h-6 bg-gradient-to-br ${getLevelColor(level)} rounded-full flex items-center justify-center`}>
        {getLevelIcon(level)}
      </div>
      <div className="hidden sm:block">
        <div className="text-xs font-semibold text-gray-700">{level}</div>
        <div className="text-xs text-gray-500">{points} pts</div>
      </div>
      {nextReward && nextReward.pointsNeeded > 0 && (
        <div className="hidden md:block">
          <div className="text-xs text-gray-500">
            {nextReward.pointsNeeded} to {nextReward.next}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyBadge;
