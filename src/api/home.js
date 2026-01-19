import api from "./client";

export const fetchHome = () => api.get("/home").then(r => r.data);
