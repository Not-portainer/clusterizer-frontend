import axios from "axios";

const apiClient = axios.create({
    baseURL: "/api/docker/local",
    headers: {
        "Content-Type": "application/json",
    },
});

export const fetchContainers = (all: boolean) =>
    apiClient.get(`/container/listOfContainers?all=${all}`);

export const fetchImages = () => apiClient.get("/image/listOfImages");

export const inspectImage = (id: string) =>
    apiClient.get(`/image/inspectImage?id=${id}`);

export const startContainer = (id: string) =>
    apiClient.post(`/container/startContainer?id=${id}`);

export const removeContainer = (id: string, force: boolean) =>
    apiClient.delete(`/container/removeContainer?id=${id}&force=${force}`);

export const removeImage = (id: string) =>
    apiClient.delete(`/container/removeImage?id=${id}`);

export const stopContainer = (id: string) =>
    apiClient.post(`/container/stopContainer?id=${id}`);

export const restartContainer = (id: string) =>
    apiClient.post(`/container/restartContainer?id=${id}`);

export const killContainer = (id: string) =>
    apiClient.delete(`/container/killContainer?id=${id}`);

export const renameContainer = (id: string, name: string) =>
    apiClient.post(`/container/renameContainer?id=${id}&name=${name}`);

export const inspectContainer = (id: string) =>
    apiClient.get(`/container/inspectContainer?id=${id}`);

export const diffContainer = (id: string) =>
    apiClient.get(`/container/diffContainer?id=${id}`);

export const statsContainer = (id: string) =>
    apiClient.get(`/client/stats?id=${id}`, { responseType: "stream" });

export const streamLogsContainer = async (
    id: string,
    follow: boolean = true,
    tail: number | null = null,
    onData: (log: any) => void
): Promise<void> => {
    const params = new URLSearchParams();
    params.append("id", id);
    params.append("follow", String(follow));
    if (tail !== null) {
        params.append("tail", String(tail));
    }

    const response = await fetch(`/api/docker/local/container/logContainer?${params.toString()}`, {
        method: "GET",
        headers: {
            "Accept": "application/x-ndjson",
        },
    });

    if (!response.body) {
        throw new Error("ReadableStream not supported in this environment.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop()!;

        for (const line of lines) {
            if (line.trim()) {
                try {
                    const log = JSON.parse(line);
                    onData(log);
                } catch (e) {
                    console.error("Failed to parse JSON line:", line, e);
                }
            }
        }
    }
};

export const createContainer = (configId: string, data: any) =>
    apiClient.post(`/${configId}/container/createContainer`, data);

export const topContainer = (id: string) =>
    apiClient.get(`/container/topContainer?id=${id}`);