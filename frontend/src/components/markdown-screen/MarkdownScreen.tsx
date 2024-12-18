import { useEffect, useState } from "react";
import Markdown from "react-markdown";

export function MarkdownScreen({ res }: { res: string }) {
    const resUrl = process.env.PUBLIC_URL + res;
    const [markdownText, setMarkdownText] = useState<string>();

    useEffect(() => {
        fetch(resUrl).then((response) => {
            response.text().then((textResponse) => {
                setMarkdownText(textResponse);
            });
        });
    }, [resUrl]);

    return (
        <Markdown>{markdownText}</Markdown>
    );
}