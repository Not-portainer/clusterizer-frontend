import React, { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import { fetchContainers, startContainer, removeContainer } from "../api/apiClient";

const Containers: React.FC = () => {
    const [containers, setContainers] = useState([]);

    useEffect(() => {
        loadContainers();
    }, []);

    const loadContainers = async () => {
        try {
            const { data } = await fetchContainers(true);
            setContainers(data);
        } catch (err) {
            message.error("Failed to fetch containers");
        }
    };

    const handleStart = async (id: string) => {
        try {
            await startContainer(id);
            message.success("Container started");
            loadContainers();
        } catch (err) {
            message.error("Failed to start container");
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await removeContainer(id, true);
            message.success("Container removed");
            loadContainers();
        } catch (err) {
            message.error("Failed to remove container");
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "State", dataIndex: "state", key: "state" },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => (
                <>
                    <Button onClick={() => handleStart(record.id)}>Start</Button>
                    <Button danger onClick={() => handleRemove(record.id)}>Remove</Button>
                </>
            ),
        },
    ];

    return <Table dataSource={containers} columns={columns} rowKey="id" />;
};

export default Containers;