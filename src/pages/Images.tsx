import React, { useEffect, useState } from "react";
import { Table, Button, message } from "antd";
import { fetchImages, removeImage } from "../api/apiClient";

const Images: React.FC = () => {
    const [images, setImages] = useState([]);

    const loadImages = async () => {
        try {
            const { data } = await fetchImages();
            const formattedImages = data.map((image: any) => ({
                id: image.Id,
                repoTag: image.RepoTags?.[0] || "No RepoTag",
            }));
            setImages(formattedImages);
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

    useEffect(() => {
        loadImages();
    }, []);

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "RepoTag",
            dataIndex: "repoTag",
            key: "repoTag",
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

    return <Table dataSource={images} columns={columns} rowKey="id" />;
};

export default Images;
