// API Routes Configuration
// This file centralizes all backend API endpoints for easy maintenance

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    USER_INFO: '/auth/userinfo',
  },

  // Memberships
  MEMBERSHIPS: {
    PLANS: '/api/v1/memberships/plans',
    PLAN_DETAIL: (planId) => `/api/v1/memberships/plans/${planId}`,
    SUBSCRIBE: '/api/v1/memberships/subscribe',
    MY_MEMBERSHIP: '/api/v1/memberships/mine',
    CANCEL: '/api/v1/memberships/mine',
    UPDATE: '/api/v1/memberships/mine',
    PAUSE: '/api/v1/memberships/mine/pause',
    RESUME: '/api/v1/memberships/mine/resume',
    HISTORY: '/api/v1/memberships/history',
    UPGRADE: '/api/v1/memberships/mine/upgrade',
    DOWNGRADE: '/api/v1/memberships/mine/downgrade',
    BENEFITS: (planId) => `/api/v1/memberships/plans/${planId}/benefits`,
    ELIGIBILITY: (planId) => `/api/v1/memberships/plans/${planId}/eligibility`,
    INQUIRY: '/api/v1/memberships/inquiry',
  },

  // Bookings/Consultations
  BOOKINGS: {
    CONSULTATION_TYPES: '/api/v1/bookings/consultation-types',
    CONSULTATION_TYPE_DETAIL: (slug) => `/api/v1/bookings/consultation-types/${slug}`,
    AVAILABILITY: '/api/v1/bookings/availability',
    CREATE: '/api/v1/bookings',
    LIST: '/api/v1/bookings',
    DETAIL: (bookingId) => `/api/v1/bookings/${bookingId}`,
    CANCEL: (bookingId) => `/api/v1/bookings/${bookingId}/cancel`,
    RESCHEDULE: (bookingId) => `/api/v1/bookings/${bookingId}/reschedule`,
    CONFIRM: (bookingId) => `/api/v1/bookings/${bookingId}/confirm`,
    HISTORY: '/api/v1/bookings/history',
    UPCOMING: '/api/v1/bookings/upcoming',
    PAST: '/api/v1/bookings/past',
    NOTES: (bookingId) => `/api/v1/bookings/${bookingId}/notes`,
    RATE: (bookingId) => `/api/v1/bookings/${bookingId}/rate`,
    STATS: '/api/v1/bookings/stats',
    ELIGIBILITY: (consultationTypeId) => `/api/v1/bookings/eligibility/${consultationTypeId}`,
    REMIND: (bookingId) => `/api/v1/bookings/${bookingId}/remind`,
  },

  // Shop
  SHOP: {
    CATEGORIES: '/api/v1/shop/categories',
    PRODUCTS: '/api/v1/shop/products',
    PRODUCT_DETAIL: (slug) => `/api/v1/shop/products/${slug}`,
    PRODUCT_SEARCH: '/api/v1/shop/products/search',
    PRODUCT_FEATURED: '/api/v1/shop/products/featured',
    PRODUCT_NEW: '/api/v1/shop/products/new',
    PRODUCT_REVIEWS: (productId) => `/api/v1/shop/products/${productId}/reviews`,
    PRODUCT_INVENTORY: (productId) => `/api/v1/shop/products/${productId}/inventory`,
    PRODUCT_VARIANTS: (productId) => `/api/v1/shop/products/${productId}/variants`,
    
    CART: '/api/v1/shop/cart',
    CART_ADD: '/api/v1/shop/cart/add',
    CART_UPDATE: '/api/v1/shop/cart/update',
    CART_REMOVE: (productId) => `/api/v1/shop/cart/remove/${productId}`,
    CART_CLEAR: '/api/v1/shop/cart/clear',
    CART_SUMMARY: '/api/v1/shop/cart/summary',
    
    WISHLIST: '/api/v1/shop/wishlists',
    WISHLIST_ADD: '/api/v1/shop/wishlists',
    WISHLIST_REMOVE: (productId) => `/api/v1/shop/wishlists/${productId}`,
    WISHLIST_TO_CART: '/api/v1/shop/wishlists/to-cart',
    
    ORDERS: '/api/v1/shop/orders',
    ORDER_DETAIL: (orderId) => `/api/v1/shop/orders/${orderId}`,
    ORDER_STATUS: (orderId) => `/api/v1/shop/orders/${orderId}/status`,
    ORDER_CANCEL: (orderId) => `/api/v1/shop/orders/${orderId}/cancel`,
    ORDER_TRACK: (orderId) => `/api/v1/shop/orders/${orderId}/track`,
    
    REVIEWS: (reviewId) => `/api/v1/shop/reviews/${reviewId}`,
    
    SHIPPING_METHODS: '/api/v1/shop/shipping/methods',
    SHIPPING_CALCULATE: '/api/v1/shop/shipping/calculate',
    
    PAYMENT_METHODS: '/api/v1/shop/payment/methods',
    PAYMENT_PROCESS: '/api/v1/shop/payment/process',
    
    DISCOUNTS_APPLY: '/api/v1/shop/discounts/apply',
    DISCOUNTS_REMOVE: '/api/v1/shop/discounts/remove',
    
    SUPPORT_CONTACT: '/api/v1/shop/support/contact',
    RETURNS: '/api/v1/shop/returns',
    RETURN_STATUS: (returnId) => `/api/v1/shop/returns/${returnId}`,
  },

  // ML (Machine Learning)
  ML: {
    WORKOUT_RECOMMEND: '/api/ml/workouts/recommend',
    PROGRESS_PREDICT: '/api/ml/progress/predict',
    FOOD_SUGGEST: '/api/ml/food/suggest',
    EXCURSION_RECOMMEND: '/api/ml/excursions/recommend',
    MEMBERSHIP_RECOMMEND: '/api/ml/memberships/recommend',
    WORKOUT_PLAN_GENERATE: '/api/ml/workout-plan/generate',
    NUTRITION_PLAN_GENERATE: '/api/ml/nutrition-plan/generate',
    FITNESS_ASSESSMENT: '/api/ml/fitness-assessment',
    GOAL_RECOMMEND: '/api/ml/goal-setting/recommend',
    RISK_ASSESSMENT: '/api/ml/risk-assessment',
    PERFORMANCE_PREDICT: '/api/ml/performance-predict',
    EXERCISE_RECOMMEND: '/api/ml/exercise-recommend',
    INJURY_RISK: '/api/ml/injury-risk',
    RECOVERY_RECOMMEND: '/api/ml/recovery-recommend',
    SLEEP_OPTIMIZATION: '/api/ml/sleep-optimization',
    HYDRATION_TRACKING: '/api/ml/hydration-tracking',
    BODY_COMP_PREDICT: '/api/ml/body-composition-predict',
    METABOLIC_RATE: '/api/ml/metabolic-rate',
    CALORIE_NEEDS: '/api/ml/calorie-needs',
    MACRONUTRIENT_RATIOS: '/api/ml/macronutrient-ratios',
    MEAL_TIMING: '/api/ml/meal-timing',
    SUPPLEMENT_RECOMMEND: '/api/ml/supplement-recommend',
    WORKOUT_ADAPTATION: '/api/ml/workout-adaptation',
    PLATEAU_DETECTION: '/api/ml/plateau-detection',
    MOTIVATION_SCORE: '/api/ml/motivation-score',
    RETENTION_PREDICT: '/api/ml/retention-predict',
    PERSONALITY_FIT: '/api/ml/personality-fit',
    CLASS_RECOMMEND: '/api/ml/class-recommend',
    EQUIPMENT_RECOMMEND: '/api/ml/equipment-recommend',
    TIME_OPTIMIZATION: '/api/ml/time-optimization',
    SOCIAL_COMPATIBILITY: '/api/ml/social-compatibility',
    WEATHER_ADAPTATION: '/api/ml/weather-adaptation',
    HEART_RATE_ZONES: '/api/ml/heart-rate-zones',
    VO2_MAX_PREDICT: '/api/ml/vo2-max-predict',
    STRESS_LEVEL_ASSESS: '/api/ml/stress-level-assess',
    ENERGY_EXPENDITURE: '/api/ml/energy-expenditure',
  },

  // Account (Need Backend Implementation)
  ACCOUNT: {
    ME: '/account/me',
    MEASUREMENTS: '/account/measurements',
    GOALS: '/account/goals',
    HEALTH_CONDITIONS: '/account/health-conditions',
    WATER_INTAKE: '/account/water-intake',
    STRENGTH_RECORDS: '/account/strength-records',
    TRAINER_RATINGS: '/account/trainer-ratings',
    BADGES: '/account/badges',
    TRAINING_SCHEDULE: '/account/training-schedule',
    ATTENDANCE: '/account/attendance',
    PROGRESS_PHOTOS: '/account/progress-photos',
    SESSION_STATS: '/account/session-stats',
    NUTRITION_PLAN: '/account/nutrition-plan',
    NUTRITION_GOALS: '/account/nutrition-goals',
  },

  // Excursions (Need Backend Implementation)
  EXCURSIONS: {
    LIST: '/excursions',
    DETAIL: (excursionId) => `/excursions/${excursionId}`,
    BOOK: '/excursions/book',
    MY_BOOKINGS: '/excursions/bookings/my',
    CANCEL_BOOKING: (bookingId) => `/excursions/bookings/${bookingId}`,
    ML_RECOMMENDATIONS: '/excursions/recommendations/ml',
    BY_LEVEL: '/excursions/by-level',
    BY_DATE: '/excursions/by-date',
    AVAILABILITY: (excursionId) => `/excursions/${excursionId}/availability`,
    ELIGIBILITY: (excursionId) => `/excursions/${excursionId}/check-eligibility`,
    REVIEWS: (excursionId) => `/excursions/${excursionId}/reviews`,
    PHOTOS: (excursionId) => `/excursions/${excursionId}/photos`,
    STATS: '/excursions/stats',
    UPCOMING: '/excursions/upcoming',
    PAST: '/excursions/past',
    RECOMMENDATIONS: (userId) => `/excursions/recommendations/${userId}`,
    WAITLIST: (excursionId) => `/excursions/${excursionId}/waitlist`,
    CATEGORIES: '/excursions/categories',
    PRICE: (excursionId) => `/excursions/${excursionId}/price`,
    REQUIREMENTS: (excursionId) => `/excursions/${excursionId}/requirements`,
    ITINERARY: (excursionId) => `/excursions/${excursionId}/itinerary`,
    PACKING_LIST: (excursionId) => `/excursions/${excursionId}/packing-list`,
  },

  // Admin (Need Backend Implementation)
  ADMIN: {
    ALL_CLIENTS: '/account/admin/all-clients',
    ALL_TRAINERS: '/account/admin/all-trainers',
    DASHBOARD_STATS: '/account/admin/dashboard-stats',
    CLIENT_STATUS: '/account/admin/client-status',
    CLIENTS_WITH_STATUS: '/account/admin/clients-with-status',
    TRAINER_ASSESSMENTS: (trainerId) => `/account/admin/trainer-assessments/${trainerId}`,
    SAVE_TRAINER_ASSESSMENT: '/account/admin/trainer-assessments',
    ORDERS: '/account/admin/orders',
    ORDER_STATUS: (orderId) => `/account/admin/orders/${orderId}/status`,
    BIRTHDAY_EMAIL: '/account/admin/send-birthday-email',
    TODAY_BIRTHDAYS: '/account/admin/today-birthdays',
    MEMBER_STATS: '/account/admin/member-stats',
    REVENUE_STATS: '/account/admin/revenue-stats',
    ATTENDANCE_STATS: '/account/admin/attendance-stats',
    EQUIPMENT_STATUS: '/account/admin/equipment-status',
    CLASS_SCHEDULE: '/account/admin/class-schedule',
    TRAINER_SCHEDULE: (trainerId) => `/account/admin/trainer-schedule/${trainerId}`,
    MEMBER_PROGRESS: (memberId) => `/account/admin/member-progress/${memberId}`,
    MEMBER_NOTES: (memberId) => `/account/admin/member-notes/${memberId}`,
    SYSTEM_HEALTH: '/account/admin/system-health',
    AUDIT_LOGS: '/account/admin/audit-logs',
    REPORTS: (reportType) => `/account/admin/reports/${reportType}`,
    NOTIFICATIONS: '/account/admin/notifications',
    SETTINGS: '/account/admin/settings',
    BACKUP_STATUS: '/account/admin/backup-status',
  },

  // Trainer (Need Backend Implementation)
  TRAINER: {
    PROFILE: '/api/v1/trainers/profile',
    CLIENTS: '/api/v1/trainers/clients',
    CLIENT_DETAIL: (clientId) => `/api/v1/trainers/clients/${clientId}`,
    CLIENT_PROGRESS: (clientId) => `/api/v1/trainers/clients/${clientId}/progress`,
    CLIENT_PROGRESS_HISTORY: (clientId) => `/api/v1/trainers/clients/${clientId}/progress-history`,
    CLIENT_NOTES: (clientId) => `/api/v1/trainers/clients/${clientId}/notes`,
    CLIENT_ATTENDANCE: (clientId) => `/api/v1/trainers/clients/${clientId}/attendance`,
    AT_RISK_CLIENTS: '/api/v1/trainers/at-risk-clients',
    CLIENT_RISK_ASSESSMENT: (clientId) => `/api/v1/trainers/clients/${clientId}/risk-assessment`,
    INTERVENTION_PLAN: (clientId) => `/api/v1/trainers/clients/${clientId}/intervention`,
    SCHEDULE: '/api/v1/trainers/schedule',
    PERFORMANCE: '/api/v1/trainers/performance',
    GRADES: '/api/v1/trainers/grades',
    REVIEWS: '/api/v1/trainers/reviews',
    PROGRAMS: '/api/v1/trainers/programs',
    EXERCISES: '/api/v1/trainers/exercises',
    WORKOUT_TEMPLATES: '/api/v1/trainers/workout-templates',
    CLIENT_MESSAGES: (clientId) => `/api/v1/trainers/clients/${clientId}/messages`,
    NUTRITION_PLANS: (clientId) => `/api/v1/trainers/clients/${clientId}/nutrition-plans`,
    MEAL_LOGS: (clientId) => `/api/v1/trainers/clients/${clientId}/meal-logs`,
    ANALYTICS: '/api/v1/trainers/analytics',
    CERTIFICATIONS: '/api/v1/trainers/certifications',
    AVAILABILITY: '/api/v1/trainers/availability',
    TIME_OFF: '/api/v1/trainers/time-off',
    GROUP_CLASSES: '/api/v1/trainers/group-classes',
    CLASS_PARTICIPANTS: (classId) => `/api/v1/trainers/group-classes/${classId}/participants`,
  },
};

// API Status
export const API_STATUS = {
  IMPLEMENTED: {
    // Fully implemented backend routes
    AUTH: true,
    MEMBERSHIPS: true,
    BOOKINGS: true,
    SHOP: true,
    ML: true,
  },
  NEEDS_IMPLEMENTATION: {
    // Routes that need backend implementation
    ACCOUNT: false,
    EXCURSIONS: false,
    ADMIN: false,
    TRAINER: false,
  },
};

// Helper function to check if route is implemented
export const isRouteImplemented = (category) => {
  return API_STATUS.IMPLEMENTED[category] || false;
};

export default API_ENDPOINTS;
