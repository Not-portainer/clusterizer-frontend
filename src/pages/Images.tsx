import React, { useEffect, useState } from "react";
import { Table, Button, message, Modal } from "antd";
import { fetchImages, removeImage, inspectImage } from "../api/apiClient";

const Images: React.FC = () => {
    const [images, setImages] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalData, setModalData] = useState<any>(null); // JSON-данные образа

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

    const handleInspect = async (id: string) => {
        try {
            const { data } = await inspectImage(id);
            setModalData(data);
            setIsModalVisible(true);
        } catch (err) {
            message.error("Failed to inspect image");
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
            render: (text: string, record: any) => (
                <a onClick={() => handleInspect(record.id)} style={{ cursor: "pointer", color: "#1890ff" }}>
                    {text}
                </a>
            ),
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

    return (
        <>
            <Table dataSource={images} columns={columns} rowKey="id" />

            <Modal
                title="Inspect Image"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                {modalData ? (
                    <pre style={{ maxHeight: "400px", overflow: "auto", background: "#f5f5f5", padding: "10px" }}>
            {JSON.stringify(modalData, null, 2)}
          </pre>
                ) : (
                    "Loading..."
                )}
            </Modal>
        </>
    );
};

export default Images;
