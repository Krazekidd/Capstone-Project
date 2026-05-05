import axiosInstance from './axiosConfig';

/**
 * Build an MLUserProfile payload from account state.
 * Converts from the Account page's measurement state into the ML API schema.
 */
export function buildMLProfile({
  age = 25,
  gender = 'male',
  weight_kg,
  height_m,
  fat_pct = 20,
  experience_level = 1,
  workout_freq = 3,
  session_duration = 1.0,
  avg_bpm = 130,
  health_conditions = [],
  goal = 'maintain',
  workout_history = null,
}) {
  return {
    age: Number(age),
    gender: gender.toLowerCase(),
    weight_kg: Number(weight_kg),
    height_m: Number(height_m),
    fat_pct: Number(fat_pct),
    experience_level: Number(experience_level),
    workout_freq: Number(workout_freq),
    session_duration: Number(session_duration),
    avg_bpm: Number(avg_bpm),
    health_conditions,
    goal,
    workout_history,
  };
}

/** POST /api/ml/workouts/recommend */
export async function getMLWorkoutRecommendation(profile) {
  const { data } = await axiosInstance.post('/api/ml/workouts/recommend', profile);
  return data;
}

/** POST /api/ml/progress/predict */
export async function getMLProgressPrediction(profile) {
  const { data } = await axiosInstance.post('/api/ml/progress/predict', profile);
  return data;
}

/** POST /api/ml/food/suggest?top_n=10 */
export async function getMLFoodSuggestions(profile, top_n = 10) {
  const { data } = await axiosInstance.post(
    `/api/ml/food/suggest?top_n=${top_n}`,
    profile
  );
  return data;
}

// Enhanced ML API functions

/** POST /api/ml/excursions/recommend */
export async function getMLExcursionRecommendations(profile) {
  const { data } = await axiosInstance.post('/api/ml/excursions/recommend', profile);
  return data;
}

/** POST /api/ml/memberships/recommend */
export async function getMLMembershipRecommendations(profile) {
  const { data } = await axiosInstance.post('/api/ml/memberships/recommend', profile);
  return data;
}

/** POST /api/ml/workout-plan/generate */
export async function generateMLWorkoutPlan(profile, preferences = {}) {
  const { data } = await axiosInstance.post('/api/ml/workout-plan/generate', {
    profile,
    preferences
  });
  return data;
}

/** POST /api/ml/nutrition-plan/generate */
export async function generateMLNutritionPlan(profile, dietaryRestrictions = []) {
  const { data } = await axiosInstance.post('/api/ml/nutrition-plan/generate', {
    profile,
    dietary_restrictions: dietaryRestrictions
  });
  return data;
}

/** POST /api/ml/fitness-assessment */
export async function getMLFitnessAssessment(profile) {
  const { data } = await axiosInstance.post('/api/ml/fitness-assessment', profile);
  return data;
}

/** POST /api/ml/goal-setting/recommend */
export async function getMLGoalRecommendations(profile) {
  const { data } = await axiosInstance.post('/api/ml/goal-setting/recommend', profile);
  return data;
}

/** POST /api/ml/risk-assessment */
export async function getMLRiskAssessment(profile) {
  const { data } = await axiosInstance.post('/api/ml/risk-assessment', profile);
  return data;
}

/** POST /api/ml/performance-predict */
export async function getMLPerformancePrediction(profile, targetDate) {
  const { data } = await axiosInstance.post('/api/ml/performance-predict', {
    profile,
    target_date: targetDate
  });
  return data;
}

/** POST /api/ml/exercise-recommend */
export async function getMLExerciseRecommendations(profile, workoutType = 'general') {
  const { data } = await axiosInstance.post('/api/ml/exercise-recommend', {
    profile,
    workout_type: workoutType
  });
  return data;
}

/** POST /api/ml/injury-risk */
export async function getMLInjuryRiskAssessment(profile, exerciseData) {
  const { data } = await axiosInstance.post('/api/ml/injury-risk', {
    profile,
    exercise_data: exerciseData
  });
  return data;
}

/** POST /api/ml/recovery-recommend */
export async function getMLRecoveryRecommendations(profile, workoutData) {
  const { data } = await axiosInstance.post('/api/ml/recovery-recommend', {
    profile,
    workout_data: workoutData
  });
  return data;
}

/** POST /api/ml/sleep-optimization */
export async function getMLSleepOptimization(profile) {
  const { data } = await axiosInstance.post('/api/ml/sleep-optimization', profile);
  return data;
}

/** POST /api/ml/hydration-tracking */
export async function getMLHydrationRecommendations(profile, activityData) {
  const { data } = await axiosInstance.post('/api/ml/hydration-tracking', {
    profile,
    activity_data: activityData
  });
  return data;
}

/** POST /api/ml/body-composition-predict */
export async function getMLBodyCompositionPrediction(profile, timeline = '3months') {
  const { data } = await axiosInstance.post('/api/ml/body-composition-predict', {
    profile,
    timeline
  });
  return data;
}

/** POST /api/ml/metabolic-rate */
export async function getMLMetabolicRateCalculation(profile) {
  const { data } = await axiosInstance.post('/api/ml/metabolic-rate', profile);
  return data;
}

/** POST /api/ml/calorie-needs */
export async function getMLCalorieNeeds(profile, activityLevel = 'moderate') {
  const { data } = await axiosInstance.post('/api/ml/calorie-needs', {
    profile,
    activity_level: activityLevel
  });
  return data;
}

/** POST /api/ml/macronutrient-ratios */
export async function getMLMacronutrientRecommendations(profile, goal) {
  const { data } = await axiosInstance.post('/api/ml/macronutrient-ratios', {
    profile,
    goal
  });
  return data;
}

/** POST /api/ml/meal-timing */
export async function getMLMealTimingRecommendations(profile, schedule) {
  const { data } = await axiosInstance.post('/api/ml/meal-timing', {
    profile,
    schedule
  });
  return data;
}

/** POST /api/ml/supplement-recommend */
export async function getMLSupplementRecommendations(profile, goals = []) {
  const { data } = await axiosInstance.post('/api/ml/supplement-recommend', {
    profile,
    goals
  });
  return data;
}

/** POST /api/ml/workout-adaptation */
export async function getMLWorkoutAdaptation(profile, currentPlan, progressData) {
  const { data } = await axiosInstance.post('/api/ml/workout-adaptation', {
    profile,
    current_plan: currentPlan,
    progress_data: progressData
  });
  return data;
}

/** POST /api/ml/plateau-detection */
export async function getMLPlateauDetection(profile, progressHistory) {
  const { data } = await axiosInstance.post('/api/ml/plateau-detection', {
    profile,
    progress_history: progressHistory
  });
  return data;
}

/** POST /api/ml/motivation-score */
export async function getMLMotivationScore(profile, behaviorData) {
  const { data } = await axiosInstance.post('/api/ml/motivation-score', {
    profile,
    behavior_data: behaviorData
  });
  return data;
}

/** POST /api/ml/retention-predict */
export async function getMLRetentionPrediction(profile, engagementData) {
  const { data } = await axiosInstance.post('/api/ml/retention-predict', {
    profile,
    engagement_data: engagementData
  });
  return data;
}

/** POST /api/ml/personality-fit */
export async function getMLPersonalityFit(profile, trainerProfiles) {
  const { data } = await axiosInstance.post('/api/ml/personality-fit', {
    profile,
    trainer_profiles: trainerProfiles
  });
  return data;
}

/** POST /api/ml/class-recommend */
export async function getMLClassRecommendations(profile, preferences = {}) {
  const { data } = await axiosInstance.post('/api/ml/class-recommend', {
    profile,
    preferences
  });
  return data;
}

/** POST /api/ml/equipment-recommend */
export async function getMLEquipmentRecommendations(profile, goals = [], budget = null) {
  const { data } = await axiosInstance.post('/api/ml/equipment-recommend', {
    profile,
    goals,
    budget
  });
  return data;
}

/** POST /api/ml/time-optimization */
export async function getMLTimeOptimization(profile, constraints = {}) {
  const { data } = await axiosInstance.post('/api/ml/time-optimization', {
    profile,
    constraints
  });
  return data;
}

/** POST /api/ml/social-compatibility */
export async function getMLSocialCompatibility(profile, groupPreferences) {
  const { data } = await axiosInstance.post('/api/ml/social-compatibility', {
    profile,
    group_preferences: groupPreferences
  });
  return data;
}

/** POST /api/ml/weather-adaptation */
export async function getMLWeatherAdaptation(profile, weatherData, plannedActivity) {
  const { data } = await axiosInstance.post('/api/ml/weather-adaptation', {
    profile,
    weather_data: weatherData,
    planned_activity: plannedActivity
  });
  return data;
}

/** POST /api/ml/heart-rate-zones */
export async function getMLHeartRateZones(profile) {
  const { data } = await axiosInstance.post('/api/ml/heart-rate-zones', profile);
  return data;
}

/** POST /api/ml/vo2-max-predict */
export async function getMLVO2MaxPrediction(profile, testResults = null) {
  const { data } = await axiosInstance.post('/api/ml/vo2-max-predict', {
    profile,
    test_results: testResults
  });
  return data;
}

/** POST /api/ml/stress-level-assess */
export async function getMLStressLevelAssessment(profile, biometricData) {
  const { data } = await axiosInstance.post('/api/ml/stress-level-assess', {
    profile,
    biometric_data: biometricData
  });
  return data;
}

/** POST /api/ml/energy-expenditure */
export async function getMLEnergyExpenditure(profile, activityData) {
  const { data } = await axiosInstance.post('/api/ml/energy-expenditure', {
    profile,
    activity_data: activityData
  });
  return data;
}
