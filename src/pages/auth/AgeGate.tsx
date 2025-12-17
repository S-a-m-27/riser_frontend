import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import KidButton from '../../components/ui/Button.kid';
import KidInput from '../../components/ui/Input.kid';
import { KidCardTitle } from '../../components/ui/Card.kid';
import { useUserStore } from '../../store/userStore';
import { kidCopy } from '../../utils/kidCopy';
import ParentalConsentModal from '../../components/ParentalConsentModal';
import { ROUTES } from '../../router/routeMap';

/**
 * Age Gate Page
 * 
 * MOCKED BEHAVIOR:
 * - Stores age in Zustand (no backend)
 * - If age < 13, shows ParentalConsentModal
 * - Blocks proceeding to signup until parental consent is "given" (mocked)
 * 
 * BACKEND NEEDED:
 * - Verify parental consent via email/phone
 * - Store age and consent status in database
 * - Enforce COPPA compliance
 */
const AgeGate: React.FC = () => {
    const navigate = useNavigate();
    const { setAge, age, parentalConsentGiven } = useUserStore();
    const [selectedAge, setSelectedAge] = useState<number | null>(age);
    const [showParentalModal, setShowParentalModal] = useState(false);
    const [error, setError] = useState<string>('');

    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 18; // Allow ages up to 18
    const maxYear = currentYear - 5; // Minimum age 5

    const handleAgeSelect = (age: number) => {
        setSelectedAge(age);
        setError('');
    };

    const handleContinue = () => {
        if (selectedAge === null) {
            setError('Please select your age');
            return;
        }

        setAge(selectedAge);

        // If under 13, require parental consent
        if (selectedAge < 13) {
            if (!parentalConsentGiven) {
                setShowParentalModal(true);
                return;
            }
        }

        // Proceed to signup
        navigate(ROUTES.AUTH.SIGNUP);
    };

    const handleYearChange = (year: number) => {
        const calculatedAge = currentYear - year;
        if (calculatedAge >= 5 && calculatedAge <= 18) {
            handleAgeSelect(calculatedAge);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-12 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-2xl"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 border-2 border-primary-400 dark:border-primary-500 shadow-2xl overflow-hidden">
                    {/* Decorative gradient overlay - very subtle */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-accent-50/30 to-kidAccent-50/30 dark:from-primary-900/20 dark:via-accent-900/20 dark:to-kidAccent-900/20 rounded-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col space-y-2 pb-6">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-primary-500 via-accent-500 to-kidAccent-500 rounded-3xl mb-6 shadow-2xl ring-4 ring-primary-200/50 dark:ring-primary-700/50"
                        >
                            <Calendar className="w-14 h-14 text-white drop-shadow-lg" />
                        </motion.div>
                        <KidCardTitle className="text-4xl md:text-5xl text-center font-extrabold mb-3 drop-shadow-sm !text-slate-900 dark:!text-slate-100">
                            {kidCopy.howOld}
                        </KidCardTitle>
                        <p className="text-center mt-2 text-lg md:text-xl font-bold !text-slate-800 dark:!text-slate-200">
                            {kidCopy.ageRequired}
                        </p>
                    </div>

                    <div className="space-y-6 relative z-10 pt-0">
                        {/* Age Picker - Large Number Buttons */}
                        <div>
                            <label className="block text-xl font-extrabold mb-5 !text-slate-900 dark:!text-slate-100">
                                {kidCopy.selectAge}
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((age) => (
                                    <motion.button
                                        key={age}
                                        whileHover={{ scale: 1.08, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleAgeSelect(age)}
                                        className={`
                                            h-16 rounded-2xl font-extrabold text-xl transition-all duration-200
                                            focus:outline-none focus:ring-4 focus:ring-primary-500/50
                                            ${selectedAge === age
                                                ? 'bg-gradient-to-br from-primary-600 via-accent-600 to-kidAccent-600 text-white shadow-2xl ring-4 ring-primary-400/50 scale-110'
                                                : 'bg-gradient-to-br from-primary-200 to-accent-200 dark:from-primary-800 dark:to-accent-800 !text-primary-900 dark:!text-primary-100 border-2 border-primary-400 dark:border-primary-600 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-gradient-to-br hover:from-primary-300 hover:to-accent-300 dark:hover:from-primary-700 dark:hover:to-accent-700 hover:shadow-xl hover:scale-105 font-bold'
                                            }
                                        `}
                                        aria-label={`Select age ${age}`}
                                    >
                                        {age}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Or Year Selector */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-primary-300 dark:border-primary-600"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white dark:bg-slate-800 px-5 py-2 rounded-full font-extrabold text-base border-2 border-primary-400 dark:border-primary-500 shadow-lg !text-primary-700 dark:!text-primary-300">
                                    Or enter your birth year
                                </span>
                            </div>
                        </div>

                        <KidInput
                            type="number"
                            label="Birth Year"
                            placeholder="e.g., 2010"
                            min={minYear}
                            max={maxYear}
                            value={selectedAge ? currentYear - selectedAge : ''}
                            onChange={(e) => {
                                const year = parseInt(e.target.value);
                                if (!isNaN(year)) {
                                    handleYearChange(year);
                                }
                            }}
                            error={error}
                        />

                        {/* Continue Button */}
                        <KidButton
                            onClick={handleContinue}
                            variant="primary"
                            size="lg"
                            className="w-full"
                            emoji="🚀"
                        >
                            {kidCopy.continue}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </KidButton>

                        {/* Privacy Banner for minors */}
                        {selectedAge && selectedAge < 13 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-5 bg-gradient-to-r from-primary-300 via-accent-300 to-kidAccent-300 dark:from-primary-800 dark:via-accent-800 dark:to-kidAccent-800 border-2 border-primary-500 dark:border-primary-400 rounded-2xl shadow-xl"
                            >
                                <p className="text-base font-extrabold leading-relaxed !text-slate-900 dark:!text-slate-100">
                                    {kidCopy.privacyBanner}{' '}
                                    <a
                                        href="/privacy"
                                        className="underline font-extrabold transition-colors !text-primary-700 dark:!text-primary-300 hover:!text-primary-800 dark:hover:!text-primary-200"
                                    >
                                        {kidCopy.learnMorePrivacy}
                                    </a>
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Parental Consent Modal */}
            <ParentalConsentModal
                isOpen={showParentalModal}
                onClose={() => setShowParentalModal(false)}
                onConsentGiven={() => {
                    setShowParentalModal(false);
                    navigate(ROUTES.AUTH.SIGNUP);
                }}
            />
        </div>
    );
};

export default AgeGate;

