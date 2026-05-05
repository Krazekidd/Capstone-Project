export * from './auth';
export * from './membership';
export * from './consultation';
export * from './shop';
export * from './user';
export * from './nutriAI';
export * from './trainer';
export * as mlApi from './mlApi';
export { default as api } from './axiosConfig';

// Re-export all API modules from api.js for backward compatibility
export {
  authAPI,
  accountAPI,
  progressAPI,
  excursionsAPI,
  consultationsAPI,
  shopAPI,
  adminAPI
} from './api';
