import React, {useEffect, useState} from "react";
import {Table, Button, message, Space, Modal} from "antd";
import {
    fetchContainers,
    removeContainer,
    startContainer,
    stopContainer,
    restartContainer,
    streamLogsContainer
} from "../api/apiClient";

const Containers: React.FC = () => {
    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [logsVisible, setLogsVisible] = useState(false);
    const [logsContent, setLogsContent] = useState("");

    const loadContainers = async () => {
        setLoading(true);
        try {
            const {data} = await fetchContainers(true);
            const formattedContainers = data.map((container: any) => ({
                id: container.Id,
                image: container.Image,
                state: container.State,
                name: container.Names[0],
            }));
            setContainers(formattedContainers);
        } catch (err) {
            message.error("Failed to fetch containers");
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async (id: string) => {
        try {
            await startContainer(id);
            message.success("Container started successfully");
            loadContainers();
        } catch (err) {
            message.error("Failed to start container");
        }
    };

    const handleStop = async (id: string) => {
        try {
            await stopContainer(id);
            message.success("Container stopped successfully");
            loadContainers();
        } catch (err) {
            message.error("Failed to stop container");
        }
    };

    const handleRestart = async (id: string) => {
        try {
            await restartContainer(id);
            message.success("Container restarted successfully");
            loadContainers();
        } catch (err) {
            message.error("Failed to restart container");
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await removeContainer(id, true);
            message.success("Container removed successfully");
            loadContainers();
        } catch (err) {
            message.error("Failed to remove container");
        }
    };

    const handleViewLogs = async (id: string) => {
        setLogsContent("");
        setLogsVisible(true);

        try {
            await streamLogsContainer(id, true, 100, (log) => {
                setLogsContent((prev) => `${prev}${JSON.stringify(log)}\n`);
            });
        } catch (err) {
            message.error("Failed to fetch container logs");
            setLogsVisible(false);
        }
    };

    useEffect(() => {
        loadContainers();
    }, []);

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Image",
            dataIndex: "image",
            key: "image",
        },
        {
            title: "State",
            dataIndex: "state",
            key: "state",
            render: (state: string) => (
                <span
                    style={{
                        color: state === "running" ? "green" : "red",
                        fontWeight: "bold",
                    }}
                >
                    {state}
                </span>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => (
                <Space>
                    {record.state !== "running" && (
                        <Button type="primary" onClick={() => handleStart(record.id)}>
                            Start
                        </Button>
                    )}
                    {record.state === "running" && (
                        <Button onClick={() => handleStop(record.id)}>Stop</Button>
                    )}
                    <Button onClick={() => handleRestart(record.id)}>Restart</Button>
                    <Button danger onClick={() => handleRemove(record.id)}>
                        Delete
                    </Button>
                    <Button onClick={() => handleViewLogs(record.id)}>Logs</Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Table
                dataSource={containers}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{pageSize: 5}}
            />
            <Modal
                title="Container Logs"
                visible={logsVisible}
                onCancel={() => setLogsVisible(false)}
                footer={null}
                width={800}
            >
                <div style={{ maxHeight: "400px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                    {logsContent
                        .split("\n")
                        .filter((line) => line.trim() !== "")
                        .map((line, index) => {
                            try {
                                const log = JSON.parse(line);
                                const isError = log.type === "STDERR";
                                return (
                                    <div
                                        key={index}
                                        style={{
                                            color: isError ? "red" : "inherit",
                                        }}
                                    >
                                        {log.payload}
                                    </div>
                                );
                            } catch (e) {
                                return (
                                    <div key={index} style={{ color: "orange" }}>
                                        {line}
                                    </div>
                                );
                            }
                        })}
                </div>
            </Modal>
        </>
    );
};

export default Containers;