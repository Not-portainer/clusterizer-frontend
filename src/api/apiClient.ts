import axios from "axios";

const apiClient = axios.create({
    baseURL: "/api/docker/local", // Замените на ваш URL
    headers: {
        "Content-Type": "application/json",
    },
});

export const fetchContainers = (all: boolean) =>
    apiClient.get(`/listOfContainers?all=${all}`);

export const fetchImages = () => apiClient.get("/listOfImages");

export const inspectImage = (id: string) =>
    apiClient.get(`/inspectImage?id=${id}`);

export const startContainer = (id: string) =>
    apiClient.post(`/startContainer?id=${id}`);

export const removeContainer = (id: string, force: boolean) =>
    apiClient.delete(`/removeContainer?id=${id}&force=${force}`);

export const removeImage = (id: string) =>
    apiClient.delete(`/removeImage?id=${id}`);
