import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

const data = (request) => request.then((r) => r.data);

export const healthCheck = () => data(api.get("/"));
export const getFlags = () => data(api.get("/flags"));
export const getEnvironments = () => data(api.get("/environments"));
export const createFlag = (payload) => data(api.post("/flags", payload));
export const updateFlag = (id, payload) => data(api.put(`/flags/${id}`, payload));
export const deleteFlag = (id) => data(api.delete(`/flags/${id}`));
export const createEnvironment = (payload) => data(api.post("/environments", payload));
export const updateEnvironment = (id, payload) => data(api.put(`/environments/${id}`, payload));
export const deleteEnvironment = (id) => data(api.delete(`/environments/${id}`));
export const getTargetingRules = () => data(api.get("/targeting-rules"));
export const createTargetingRule = (payload) => data(api.post("/targeting-rules", payload));
export const updateTargetingRule = (id, payload) => data(api.put(`/targeting-rules/${id}`, payload));
export const deleteTargetingRule = (id) => data(api.delete(`/targeting-rules/${id}`));
export const evaluateFlag = (payload) => data(api.post("/evaluate", payload));
export const getAuditLogs = () => data(api.get("/audit-logs"));
export const getEvaluationAnalytics = () => data(api.get("/evaluation-analytics"));
export const getCleanupCandidates = (days = 30) => data(api.get(`/cleanup/flags?days=${days}`));

export default api;
