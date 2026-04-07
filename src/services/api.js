import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

export const getAIHelp = async (data) => {
  const res = await api.post("/ai-help", data);
  return res.data;
};
