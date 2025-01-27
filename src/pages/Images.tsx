import React, { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import { fetchImages, removeImage } from "../api/apiClient";

const Images: React.FC = () => {
    const [images, setImages] = useState([]);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            const { data } = await fetchImages();
            setImages(data);
        } catch (err) {
            message.error("Failed to fetch images");
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await removeImage(id);
            message.success("Image removed");
            loadImages();
        } catch (err) {
            message.error("Failed to remove image");
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Repository", dataIndex: "repository", key: "repository" },
        { title: "Tag", dataIndex: "tag", key: "tag" },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => (
                <Button danger onClick={() => handleRemove(record.id)}>
                    Remove
                </Button>
            ),
        },
    ];

    return <Table dataSource={images} columns={columns} rowKey="id" />;
};

export default Images;