import axios from "axios";


const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: {
        "Content-Type": "application/json",
    },
});


export const getFlags = async () => {
    const response = await api.get("/flags");
    return response.data;
};


export const getEnvironments = async () => {
    const response = await api.get("/environments");
    return response.data;
};


export const createFlag = async (flagData) => {
    const response = await api.post("/flags", flagData);
    return response.data;
};


export const updateFlag = async (flagId, flagData) => {
    const response = await api.put(
        `/flags/${flagId}`,
        flagData
    );

    return response.data;
};


export const deleteFlag = async (flagId) => {
    const response = await api.delete(
        `/flags/${flagId}`
    );

    return response.data;
};


export const getTargetingRules = async () => {
    const response = await api.get("/targeting-rules");
    return response.data;
};


export const createTargetingRule = async (ruleData) => {
    const response = await api.post(
        "/targeting-rules",
        ruleData
    );

    return response.data;
};


export const updateTargetingRule = async (
    ruleId,
    ruleData
) => {
    const response = await api.put(
        `/targeting-rules/${ruleId}`,
        ruleData
    );

    return response.data;
};


export const deleteTargetingRule = async (ruleId) => {
    const response = await api.delete(
        `/targeting-rules/${ruleId}`
    );

    return response.data;
};


export const getAuditLogs = async () => {
    const response = await api.get("/audit-logs");
    return response.data;
};


export const getEvaluationAnalytics = async () => {
    const response = await api.get(
        "/evaluation-analytics"
    );

    return response.data;
};


export const getCleanupCandidates = async (days = 30) => {
    const response = await api.get(
        `/cleanup/flags?days=${days}`
    );

    return response.data;
};


export default api;