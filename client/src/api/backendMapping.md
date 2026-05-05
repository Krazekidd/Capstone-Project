# Backend API Mapping

This document maps frontend API endpoints to backend routes.

## Authentication Routes

### Frontend: `authAPI`
- `login` → `POST /auth/login`
- `register` → `POST /auth/register`
- `logout` → `POST /auth/logout`
- `refreshToken` → `POST /auth/refresh`
- `forgotPassword` → `POST /auth/forgot-password`
- `resetPassword` → `POST /auth/reset-password`
- `changePassword` → `POST /auth/change-password`
- `verifyToken` → `GET /auth/verify`
- `getUserInfo` → `GET /auth/userinfo`

## Membership Routes

### Frontend: `membershipAPI`
- `getMembershipPlans` → `GET /api/v1/memberships/plans`
- `getMembershipPlan` → `GET /api/v1/memberships/plans/{plan_id}`
- `subscribeToPlan` → `POST /api/v1/memberships/subscribe`
- `getUserMembership` → `GET /api/v1/memberships/mine`
- `cancelMembership` → `DELETE /api/v1/memberships/mine`

## Consultation/Booking Routes

### Frontend: `consultationsAPI`
- `getConsultationTypes` → `GET /api/v1/bookings/consultation-types`
- `getConsultationType` → `GET /api/v1/bookings/consultation-types/{slug}`
- `getAvailability` → `GET /api/v1/bookings/availability`
- `bookConsultation` → `POST /api/v1/bookings`
- `getMyConsultations` → `GET /api/v1/bookings`
- `getBooking` → `GET /api/v1/bookings/{booking_id}`
- `cancelConsultation` → `PATCH /api/v1/bookings/{booking_id}/cancel`

## Shop Routes

### Frontend: `shopAPI`
- `getProducts` → `GET /api/v1/shop/products`
- `getProductById` → `GET /api/v1/shop/products/{slug}`
- `createProductReview` → `POST /api/v1/shop/products/{product_id}/reviews`
- `getProductReviews` → `GET /api/v1/shop/products/{product_id}/reviews`
- `getWishlist` → `GET /api/v1/shop/wishlists`
- `addToWishlist` → `POST /api/v1/shop/wishlists`
- `removeFromWishlist` → `DELETE /api/v1/shop/wishlists/{product_id}`
- `placeOrder` → `POST /api/v1/shop/orders`
- `getOrders` → `GET /api/v1/shop/orders`
- `getOrder` → `GET /api/v1/shop/orders/{order_id}`

## ML Routes

### Frontend: `mlApi`
- `getMLWorkoutRecommendation` → `POST /api/ml/workouts/recommend`
- `getMLProgressPrediction` → `POST /api/ml/progress/predict`
- `getMLFoodSuggestions` → `POST /api/ml/food/suggest`

## Missing Backend Routes

The following frontend API endpoints need corresponding backend routes:

### Account/Progress Routes
- `accountAPI.getMyAccount` → `GET /account/me`
- `accountAPI.updateAccount` → `PUT /account/me`
- `accountAPI.getMeasurements` → `GET /account/measurements`
- `accountAPI.updateMeasurements` → `PUT /account/measurements`
- `accountAPI.getGoals` → `GET /account/goals`
- `accountAPI.updateGoals` → `PUT /account/goals`
- `accountAPI.getHealthConditions` → `GET /account/health-conditions`
- `accountAPI.updateHealthConditions` → `PUT /account/health-conditions`
- `progressAPI.getWaterIntake` → `GET /account/water-intake`
- `progressAPI.updateWaterIntake` → `PUT /account/water-intake`
- `progressAPI.getStrengthRecords` → `GET /account/strength-records`
- `progressAPI.addStrengthRecord` → `POST /account/strength-records`
- `progressAPI.updateStrengthRecord` → `PUT /account/strength-records/{record_id}`
- `progressAPI.deleteStrengthRecord` → `DELETE /account/strength-records/{record_id}`

### Excursions Routes
- `excursionsAPI.getExcursions` → `GET /excursions`
- `excursionsAPI.getExcursionById` → `GET /excursions/{excursion_id}`
- `excursionsAPI.bookExcursion` → `POST /excursions/book`
- `excursionsAPI.getMyBookings` → `GET /excursions/bookings/my`
- `excursionsAPI.cancelBooking` → `DELETE /excursions/bookings/{booking_id}`
- `excursionsAPI.getMLRecommendations` → `GET /excursions/recommendations/ml`

### Admin Routes
- `adminAPI.getAllClients` → `GET /account/admin/all-clients`
- `adminAPI.getAllTrainers` → `GET /account/admin/all-trainers`
- `adminAPI.getDashboardStats` → `GET /account/admin/dashboard-stats`
- `adminAPI.getClientStatusCounts` → `GET /account/admin/client-status`
- `adminAPI.getClientsWithStatus` → `GET /account/admin/clients-with-status`
- `adminAPI.getTrainerAssessments` → `GET /account/admin/trainer-assessments/{trainer_id}`
- `adminAPI.saveTrainerAssessment` → `POST /account/admin/trainer-assessments`

### Trainer Routes
- `trainerAPI.getTrainerProfile` → `GET /api/v1/trainers/profile`
- `trainerAPI.updateTrainerProfile` → `PUT /api/v1/trainers/profile`
- `trainerAPI.getTrainerClients` → `GET /api/v1/trainers/clients`
- `trainerAPI.getClientDetails` → `GET /api/v1/trainers/clients/{client_id}`
- `trainerAPI.updateClientProgress` → `PUT /api/v1/trainers/clients/{client_id}/progress`
- `trainerAPI.getClientProgressHistory` → `GET /api/v1/trainers/clients/{client_id}/progress-history`
- `trainerAPI.addClientNote` → `POST /api/v1/trainers/clients/{client_id}/notes`
- `trainerAPI.getClientNotes` → `GET /api/v1/trainers/clients/{client_id}/notes`

## Notes

1. **Base URL**: All backend routes are served from `http://localhost:8000`
2. **Authentication**: Most routes require JWT token in Authorization header
3. **Response Format**: Backend uses standardized response models with proper error handling
4. **Missing Routes**: Some advanced features (excursions, admin, trainer) need backend implementation
5. **Data Models**: Frontend API expects data structures that match backend Pydantic schemas

## Implementation Priority

1. **High Priority** (Already implemented):
   - Authentication ✅
   - Memberships ✅
   - Consultations/Bookings ✅
   - Shop ✅
   - ML Recommendations ✅

2. **Medium Priority** (Need backend implementation):
   - Account/Progress tracking
   - Excursions
   - Admin dashboard

3. **Low Priority** (Advanced features):
   - Trainer-specific features
   - Advanced ML features
   - System administration
