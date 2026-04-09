import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL?.trim();
const normalizedBaseUrl = rawBaseUrl
  ? rawBaseUrl.replace(/\/+$/, "")
  : "";

const api = axios.create({
  baseURL: normalizedBaseUrl || "/api",
});

export const getAIHelp = async (data) => {
  const res = await api.post("/ai-help", data);
  return res.data;
};
