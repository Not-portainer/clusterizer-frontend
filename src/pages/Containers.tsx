import React, { useEffect, useState } from "react";
import { Table, Button, message } from "antd";
import { fetchContainers, removeContainer } from "../api/apiClient";

const Containers: React.FC = () => {
    const [containers, setContainers] = useState([]);

    const loadContainers = async () => {
        try {
            const { data } = await fetchContainers(true); // Получаем данные с параметром `all=true`
            const formattedContainers = data.map((container: any) => ({
                id: container.Id,
                image: container.Image,
                state: container.State,
            }));
            setContainers(formattedContainers);
        } catch (err) {
            message.error("Failed to fetch containers");
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
            title: "Image",
            dataIndex: "image",
            key: "image",
        },
        {
            title: "State",
            dataIndex: "state",
            key: "state",
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => (
                <Button danger onClick={() => handleRemove(record.id)}>
                    Delete
                </Button>
            ),
        },
    ];

    return <Table dataSource={containers} columns={columns} rowKey="id" />;
};

export default Containers;
