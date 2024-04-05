import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {  Group } from '@mantine/core';


export default function MdReader({fileName}) {
    const [content, setContent] = useState("");

    useEffect(() => {
        const path = "../consents/" + fileName
        console.log(path)
        fetch(path)
            .then((response) => response.text())
            .then((text) =>  setContent(text));
    }, []);

    return (
        <div>
            <ReactMarkdown>{content}</ReactMarkdown>

            <Group
                position="right"
                spacing="xs"
                mt="xl"
            >
            </Group>
        </div>
    );
};