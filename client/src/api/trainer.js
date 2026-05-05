import api from './axiosConfig';

// Trainer Profile
export const getTrainerProfile = async () => {
  const response = await api.get('/api/v1/trainers/profile');
  return response.data;
};

export const updateTrainerProfile = async (profileData) => {
  const response = await api.put('/api/v1/trainers/profile', profileData);
  return response.data;
};

// Trainer Clients
export const getTrainerClients = async () => {
  const response = await api.get('/api/v1/trainers/clients');
  return response.data;
};

export const getClientDetails = async (clientId) => {
  const response = await api.get(`/api/v1/trainers/clients/${clientId}`);
  return response.data;
};

export const updateClientProgress = async (clientId, progressData) => {
  const response = await api.put(`/api/v1/trainers/clients/${clientId}/progress`, progressData);
  return response.data;
};

export const getClientProgressHistory = async (clientId) => {
  const response = await api.get(`/api/v1/trainers/clients/${clientId}/progress-history`);
  return response.data;
};

export const addClientNote = async (clientId, noteData) => {
  const response = await api.post(`/api/v1/trainers/clients/${clientId}/notes`, noteData);
  return response.data;
};

export const getClientNotes = async (clientId) => {
  const response = await api.get(`/api/v1/trainers/clients/${clientId}/notes`);
  return response.data;
};

export const getClientAttendance = async (clientId) => {
  const response = await api.get(`/api/v1/trainers/clients/${clientId}/attendance`);
  return response.data;
};

export const logClientAttendance = async (clientId, attendanceData) => {
  const response = await api.post(`/api/v1/trainers/clients/${clientId}/attendance`, attendanceData);
  return response.data;
};

// Client Risk Assessment
export const getAtRiskClients = async () => {
  const response = await api.get('/api/v1/trainers/at-risk-clients');
  return response.data;
};

export const getClientRiskAssessment = async (clientId) => {
  const response = await api.get(`/api/v1/trainers/clients/${clientId}/risk-assessment`);
  return response.data;
};

export const createInterventionPlan = async (clientId, interventionData) => {
  const response = await api.post(`/api/v1/trainers/clients/${clientId}/intervention`, interventionData);
  return response.data;
};

export const updateInterventionPlan = async (interventionId, interventionData) => {
  const response = await api.put(`/api/v1/trainers/interventions/${interventionId}`, interventionData);
  return response.data;
};

// Trainer Schedule
export const getTrainerSchedule = async (startDate, endDate) => {
  const response = await api.get('/api/v1/trainers/schedule', {
    params: { start_date: startDate, end_date: endDate }
  });
  return response.data;
};

export const updateTrainerSchedule = async (scheduleId, scheduleData) => {
  const response = await api.put(`/api/v1/trainers/schedule/${scheduleId}`, scheduleData);
  return response.data;
};

export const addScheduleItem = async (scheduleData) => {
  const response = await api.post('/api/v1/trainers/schedule', scheduleData);
  return response.data;
};

export const deleteScheduleItem = async (scheduleId) => {
  const response = await api.delete(`/api/v1/trainers/schedule/${scheduleId}`);
  return response.data;
};

// Trainer Performance & Reviews
export const getTrainerPerformance = async () => {
  const response = await api.get('/api/v1/trainers/performance');
  return response.data;
};

export const getTrainerGrades = async () => {
  const response = await api.get('/api/v1/trainers/grades');
  return response.data;
};

export const getTrainerReviews = async () => {
  const response = await api.get('/api/v1/trainers/reviews');
  return response.data;
};

export const respondToReview = async (reviewId, response) => {
  const response = await api.post(`/api/v1/trainers/reviews/${reviewId}/respond`, { response });
  return response.data;
};

// Training Programs
export const getTrainingPrograms = async () => {
  const response = await api.get('/api/v1/trainers/programs');
  return response.data;
};

export const createTrainingProgram = async (programData) => {
  const response = await api.post('/api/v1/trainers/programs', programData);
  return response.data;
};

export const updateTrainingProgram = async (programId, programData) => {
  const response = await api.put(`/api/v1/trainers/programs/${programId}`, programData);
  return response.data;
};

export const deleteTrainingProgram = async (programId) => {
  const response = await api.delete(`/api/v1/trainers/programs/${programId}`);
  return response.data;
};

export const assignProgramToClient = async (clientId, programId) => {
  const response = await api.post(`/api/v1/trainers/clients/${clientId}/assign-program`, { program_id: programId });
  return response.data;
};

// Exercise Library
export const getExerciseLibrary = async (filters = {}) => {
  const response = await api.get('/api/v1/trainers/exercises', { params: filters });
  return response.data;
};

export const addExercise = async (exerciseData) => {
  const response = await api.post('/api/v1/trainers/exercises', exerciseData);
  return response.data;
};

export const updateExercise = async (exerciseId, exerciseData) => {
  const response = await api.put(`/api/v1/trainers/exercises/${exerciseId}`, exerciseData);
  return response.data;
};

export const deleteExercise = async (exerciseId) => {
  const response = await api.delete(`/api/v1/trainers/exercises/${exerciseId}`);
  return response.data;
};

// Workout Templates
export const getWorkoutTemplates = async () => {
  const response = await api.get('/api/v1/trainers/workout-templates');
  return response.data;
};

export const createWorkoutTemplate = async (templateData) => {
  const response = await api.post('/api/v1/trainers/workout-templates', templateData);
  return response.data;
};

export const updateWorkoutTemplate = async (templateId, templateData) => {
  const response = await api.put(`/api/v1/trainers/workout-templates/${templateId}`, templateData);
  return response.data;
};

export const deleteWorkoutTemplate = async (templateId) => {
  const response = await api.delete(`/api/v1/trainers/workout-templates/${templateId}`);
  return response.data;
};

// Client Communication
export const getClientMessages = async (clientId) => {
  const response = await api.get(`/api/v1/trainers/clients/${clientId}/messages`);
  return response.data;
};

export const sendMessageToClient = async (clientId, messageData) => {
  const response = await api.post(`/api/v1/trainers/clients/${clientId}/messages`, messageData);
  return response.data;
};

export const markMessageAsRead = async (messageId) => {
  const response = await api.patch(`/api/v1/trainers/messages/${messageId}/read`);
  return response.data;
};

// Nutrition & Meal Plans
export const getClientNutritionPlans = async (clientId) => {
  const response = await api.get(`/api/v1/trainers/clients/${clientId}/nutrition-plans`);
  return response.data;
};

export const createNutritionPlan = async (clientId, nutritionData) => {
  const response = await api.post(`/api/v1/trainers/clients/${clientId}/nutrition-plans`, nutritionData);
  return response.data;
};

export const updateNutritionPlan = async (planId, nutritionData) => {
  const response = await api.put(`/api/v1/trainers/nutrition-plans/${planId}`, nutritionData);
  return response.data;
};

export const getClientMealLogs = async (clientId) => {
  const response = await api.get(`/api/v1/trainers/clients/${clientId}/meal-logs`);
  return response.data;
};

// Trainer Analytics
export const getTrainerAnalytics = async (period = 'month') => {
  const response = await api.get('/api/v1/trainers/analytics', {
    params: { period }
  });
  return response.data;
};

export const getClientAnalytics = async (clientId) => {
  const response = await api.get(`/api/v1/trainers/clients/${clientId}/analytics`);
  return response.data;
};

export const getAttendanceAnalytics = async () => {
  const response = await api.get('/api/v1/trainers/attendance-analytics');
  return response.data;
};

export const getProgressAnalytics = async () => {
  const response = await api.get('/api/v1/trainers/progress-analytics');
  return response.data;
};

// Certifications & Qualifications
export const getTrainerCertifications = async () => {
  const response = await api.get('/api/v1/trainers/certifications');
  return response.data;
};

export const addCertification = async (certificationData) => {
  const response = await api.post('/api/v1/trainers/certifications', certificationData);
  return response.data;
};

export const updateCertification = async (certificationId, certificationData) => {
  const response = await api.put(`/api/v1/trainers/certifications/${certificationId}`, certificationData);
  return response.data;
};

export const deleteCertification = async (certificationId) => {
  const response = await api.delete(`/api/v1/trainers/certifications/${certificationId}`);
  return response.data;
};

// Trainer Availability
export const getTrainerAvailability = async () => {
  const response = await api.get('/api/v1/trainers/availability');
  return response.data;
};

export const updateTrainerAvailability = async (availabilityData) => {
  const response = await api.put('/api/v1/trainers/availability', availabilityData);
  return response.data;
};

export const setTimeOff = async (timeOffData) => {
  const response = await api.post('/api/v1/trainers/time-off', timeOffData);
  return response.data;
};

// Group Classes
export const getGroupClasses = async () => {
  const response = await api.get('/api/v1/trainers/group-classes');
  return response.data;
};

export const createGroupClass = async (classData) => {
  const response = await api.post('/api/v1/trainers/group-classes', classData);
  return response.data;
};

export const updateGroupClass = async (classId, classData) => {
  const response = await api.put(`/api/v1/trainers/group-classes/${classId}`, classData);
  return response.data;
};

export const deleteGroupClass = async (classId) => {
  const response = await api.delete(`/api/v1/trainers/group-classes/${classId}`);
  return response.data;
};

export const getClassParticipants = async (classId) => {
  const response = await api.get(`/api/v1/trainers/group-classes/${classId}/participants`);
  return response.data;
};

export const addParticipantToClass = async (classId, clientId) => {
  const response = await api.post(`/api/v1/trainers/group-classes/${classId}/participants`, { client_id: clientId });
  return response.data;
};

export const removeParticipantFromClass = async (classId, clientId) => {
  const response = await api.delete(`/api/v1/trainers/group-classes/${classId}/participants/${clientId}`);
  return response.data;
};
