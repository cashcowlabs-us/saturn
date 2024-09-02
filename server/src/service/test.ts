const p = `
Create a Blog [400-600 words], metaTitle [1 line title strictly], metaDescription [1-2 liners], that blends SEO best practices with a warm, engaging tone.
-----------------------------------------------------------------
Here is a previous blog that we generated for you: ${""}
-----------------------------------------------------------------
Start by identifying common questions and concerns your target audience has from the keywords:

Primary keyword: ${"ai seo"}

Secondary keyword: ${"git repository"}

Use natural, everyday language to make your points, avoiding jargon unless it's widely understood by your readers. Incorporate relatable examples and personal stories to illustrate your advice, making the content feel like a conversation with a knowledgeable friend. Incorporate keywords smoothly into your text, ensuring they enhance rather than disrupt the flow. Use them in headings, subheadings, and throughout the body in a way that feels natural. Break down complex ideas with bullet points, numbered lists, and bold text to make the content easily scannable for readers and search engines alike.

Incorporate relevant keywords where appropriate. Encourage reader interaction by posing questions, inviting comments, and suggesting social shares. This not only boosts engagement but also signals to search engines that your content is valuable and engaging. Finally, keep your content up-to-date. Regular updates signal to search engines that your site is relevant, and it gives you the opportunity to refresh your SEO efforts and deepen your connection with readers.
`;

const requestFn = async () => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer sk-proj-UV5Gdmv0S31u9523SMdXT3BlbkFJUC2B7e6Vyh8jUtQ54Qva`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "gpt-4o-mini", // Update to the correct model
            max_tokens: 500,
            messages: [
                {
                    role: "system",
                    content: "You are a content creator specializing in SEO and engaging blog posts."
                },
                {
                    role: "user",
                    content: p
                }
            ],
            response_format: {
                "type": "json_schema",
                "json_schema": {
                    "name": "blog_generation",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "meta_title": { "type": "string" },
                            "meta_description": { "type": "string" },
                            "title": { "type": "string" },
                            "body": { "type": "string" }
                        },
                        "required": [
                            "meta_title",
                            "meta_description",
                            "title",
                            "body"
                        ]
                    },
                },
            },
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Response Data:', JSON.parse(responseData.choices[0].message.content));

    return responseData;
};

requestFn();
