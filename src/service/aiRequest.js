import { InferenceClient } from "@huggingface/inference";
import { OpenAI } from "openai";

async function aiRequest(prompt) {
    // const client = new InferenceClient(process.env.REACT_APP_HUGGINGFACE_API_KEY);
    // const chatCompletion = await client.chatCompletion({
    //     provider: "hyperbolic",
    //     model: "deepseek-ai/DeepSeek-R1-0528",
    //     messages: [
    //         {
    //             role: "user",
    //             content: prompt,
    //         },
    //     ],
    // });
    // console.log(chatCompletion.choices[0].message);
    // console.log(chatCompletion.choices[0]);
    // console.log(chatCompletion);

    // return chatCompletion.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();


    const client = new OpenAI({
        baseURL: "https://router.huggingface.co/novita/v3/openai",
        apiKey: process.env.REACT_APP_HUGGINGFACE_API_KEY,
    });

    const chatCompletion = await client.chat.completions.create({
        max_tokens: 1000,
        model: "deepseek/deepseek-r1-0528",
        messages: [
            {
                role: "system",
                content: "You are a plain text assistant. Never use HTML tags, markdown, or headers like ### or <think>. Only return plain text explanations and Python code without formatting.",
            },
            {
                role: "user",
                content: "What is the capital of France?",
            },
        ],
    });

    console.log(chatCompletion.choices[0].summary_text);
    
    return chatCompletion.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/gi, "")
  .replace(/^#+\s.*$/gim, "") // remove markdown titles like ### Title
  .replace(/[*_`>]/g, "") // remove markdown styling
  .trim();
}

export default aiRequest;