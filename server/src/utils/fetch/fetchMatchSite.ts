import config from "../config";

export default async function fetchCreateEmbeddings(input: string) {
    try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.openaiKey}`,
            },
            body: JSON.stringify({
                input: input,
                model: 'text-embedding-3-small',
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}