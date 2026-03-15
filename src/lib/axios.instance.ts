import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://api.groq.com/openai/v1",
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
    "Content-Type": "application/json",
  },
});
