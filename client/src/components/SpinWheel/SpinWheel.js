import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GiftIcon, 
  SparklesIcon, 
  XMarkIcon,
  TrophyIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

const SpinWheel = ({ isOpen, onClose, onReward }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [canSpin, setCanSpin] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [wheelData, setWheelData] = useState(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);
  const { showSuccess, showError } = useToast();

  // Default wheel segments with Clothica theme
  const defaultSegments = useMemo(() => [
    { name: '10% OFF', reward: '10', type: 'discount', color: '#6C7A59', probability: 30 },
    { name: 'Free Shipping', reward: 'free_shipping', type: 'free_shipping', color: '#D6BFAF', probability: 25 },
    { name: '50 Points', reward: '50', type: 'loyalty_points', color: '#8B4513', probability: 20 },
    { name: '15% OFF', reward: '15', type: 'discount', color: '#5A6A4A', probability: 15 },
    { name: '100 Points', reward: '100', type: 'loyalty_points', color: '#A0522D', probability: 8 },
    { name: 'Try Again', reward: 'try_again', type: 'try_again', color: '#696969', probability: 2 }
  ], []);

  const checkSpinEligibility = useCallback(async () => {
    try {
      const response = await api.get('/api/loyalty-member/spin-wheel/eligibility');
      setCanSpin(response.data.data.canSpin);
      
      // You could also fetch wheel configuration here
      setWheelData({
        segments: defaultSegments,
        canSpin: response.data.data.canSpin,
        availableSpins: response.data.data.availableSpins
      });
    } catch (error) {
      console.error('Error checking spin eligibility:', error);
      showError('Unable to check spin eligibility');
    }
  }, [showError, defaultSegments]);

  useEffect(() => {
    if (isOpen) {
      checkSpinEligibility();
    }
  }, [isOpen, checkSpinEligibility]);


  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setSpinResult(null);

    try {
      // Calculate random rotation (multiple full rotations + random position)
      const spins = 5 + Math.random() * 5; // 5-10 full rotations
      const finalRotation = rotation + (spins * 360);
      setRotation(finalRotation);

      // Call API to perform spin
      const response = await api.post('/api/loyalty-member/spin-wheel/spin');
      const result = response.data.data;

      // Wait for animation to complete
      setTimeout(() => {
        setSpinResult(result);
        setIsSpinning(false);
        setCanSpin(result.remainingSpins > 0);
        
        // Show success message
        showSuccess(`You won: ${result.segment.name}!`);
        
        // Notify parent component
        if (onReward) {
          onReward(result);
        }
      }, 3000);

    } catch (error) {
      console.error('Error spinning wheel:', error);
      setIsSpinning(false);
      showError(error.response?.data?.message || 'Failed to spin wheel');
    }
  };

  const getRewardIcon = (type) => {
    switch (type) {
      case 'discount':
        return <TagIcon className="h-5 w-5" />;
      case 'loyalty_points':
        return <TrophyIcon className="h-5 w-5" />;
      case 'free_shipping':
        return <GiftIcon className="h-5 w-5" />;
      default:
        return <SparklesIcon className="h-5 w-5" />;
    }
  };

  const segments = wheelData?.segments || defaultSegments;
  const segmentAngle = 360 / segments.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Spin to Win!</h2>
              <p className="text-gray-600">
                {canSpin 
                  ? "Spin the wheel for exclusive rewards!" 
                  : "Come back tomorrow for another spin!"
                }
              </p>
            </div>

            {/* Spin Wheel */}
            <div className="relative mb-8">
              <div className="w-80 h-80 mx-auto relative">
                {/* Wheel Container */}
                <div className="relative w-full h-full">
                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-[#6C7A59]"></div>
                  </div>

                  {/* Wheel */}
                  <motion.div
                    ref={wheelRef}
                    className="w-full h-full rounded-full border-8 border-[#6C7A59] relative overflow-hidden shadow-2xl"
                    animate={{ rotate: rotation }}
                    transition={{ 
                      duration: isSpinning ? 3 : 0,
                      ease: isSpinning ? [0.23, 1, 0.32, 1] : "linear"
                    }}
                  >
                    {segments.map((segment, index) => {
                      const startAngle = index * segmentAngle;
                      const endAngle = (index + 1) * segmentAngle;
                      
                      return (
                        <div
                          key={index}
                          className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm"
                          style={{
                            background: `conic-gradient(from ${startAngle}deg, ${segment.color} 0deg, ${segment.color} ${segmentAngle}deg, transparent ${segmentAngle}deg)`,
                            clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180)}%)`
                          }}
                        >
                          <div 
                            className="absolute flex flex-col items-center justify-center text-center"
                            style={{
                              transform: `rotate(${startAngle + segmentAngle / 2 - 90}deg) translateY(-60px)`,
                              transformOrigin: 'center'
                            }}
                          >
                            <div className="flex items-center space-x-1">
                              {getRewardIcon(segment.type)}
                              <span className="text-xs font-semibold whitespace-nowrap">
                                {segment.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Center Circle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full border-4 border-[#6C7A59] flex items-center justify-center shadow-lg">
                        <SparklesIcon className="h-6 w-6 text-[#6C7A59]" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Spin Button */}
            <div className="text-center">
              <motion.button
                onClick={handleSpin}
                disabled={!canSpin || isSpinning}
                className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                  canSpin && !isSpinning
                    ? 'bg-gradient-to-r from-[#6C7A59] to-[#5A6A4A] hover:from-[#5A6A4A] hover:to-[#4A5A3A] shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {isSpinning ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Spinning...</span>
                  </div>
                ) : canSpin ? (
                  'SPIN NOW!'
                ) : (
                  'No Spins Available'
                )}
              </motion.button>
              
              {wheelData?.availableSpins > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {wheelData.availableSpins} spin{wheelData.availableSpins !== 1 ? 's' : ''} remaining today
                </p>
              )}
            </div>

            {/* Result Modal */}
            <AnimatePresence>
              {spinResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-white bg-opacity-95 rounded-3xl flex items-center justify-center"
                >
                  <div className="text-center p-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <TrophyIcon className="h-10 w-10 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Congratulations! 🎉
                    </h3>
                    
                    <p className="text-lg text-gray-700 mb-4">
                      You won: <span className="font-semibold text-[#6C7A59]">{spinResult.segment.name}</span>
                    </p>
                    
                    {spinResult.rewardDetails && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        {spinResult.rewardDetails.type === 'discount' && (
                          <p className="text-sm text-gray-600">
                            Use code: <span className="font-mono font-bold">{spinResult.rewardDetails.code}</span>
                          </p>
                        )}
                        {spinResult.rewardDetails.type === 'loyalty_points' && (
                          <p className="text-sm text-gray-600">
                            {spinResult.rewardDetails.points} points added to your account!
                          </p>
                        )}
                        {spinResult.rewardDetails.type === 'free_shipping' && (
                          <p className="text-sm text-gray-600">
                            Free shipping on your next order!
                          </p>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors"
                    >
                      Awesome!
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpinWheel;
