import { Groq } from 'groq-sdk';

async function aiRequest(prompt) {
    const groq = new Groq({ apiKey: process.env.REACT_APP_AI_KEY, dangerouslyAllowBrowser: true });

    const chatCompletion = await groq.chat.completions.create({
        "messages": [
            {
                "role": "system",
                "content": "You are an intelligent html and blog assistant. You must follow these rules strictly and without exception. use HTML tags and do not use any other markdown formatting. provide explanations as said. Always include pre tag and different style with code to differentiate clearly and follow professional and academic styles. remember that the blog post has a header above it/externally. always remember to add responsive text styles"
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "temperature": 1,
        // "max_completion_tokens": 1024,
        "top_p": 1,
        "stream": false,
        "stop": null
    });

    return chatCompletion.choices[0].message.content;
}

export default aiRequest;