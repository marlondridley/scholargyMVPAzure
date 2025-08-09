// backend/services/aiService.js
const { OpenAIClient } = require("@azure/openai");

const openaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const openaiApiKey = process.env.AZURE_OPENAI_API_KEY;
const gpt4oDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
const embeddingDeploymentName = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME;

let openaiClient;

if (openaiEndpoint && openaiApiKey && gpt4oDeploymentName && embeddingDeploymentName) {
  try {
    // Create separate clients for chat and embeddings
    const chatClient = new OpenAIClient(
      `${openaiEndpoint}/openai/deployments/${gpt4oDeploymentName}`,
      openaiApiKey
    );

    const embeddingClient = new OpenAIClient(
      `${openaiEndpoint}/openai/deployments/${embeddingDeploymentName}`,
      openaiApiKey
    );

    // Store both clients for use in service functions
    openaiClient = {
      chat: chatClient,
      embedding: embeddingClient
    };

    console.log("✅ Azure OpenAI Service Initialized.");
  } catch (err) {
    console.error("❌ Failed to initialize Azure OpenAI clients:", err.message);
    openaiClient = null;
  }
} else {
  console.warn("⚠️ Azure OpenAI environment variables not fully configured. AI features will be disabled.");
}

/**
 * Generate an embedding vector from input text
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function generateEmbedding(text) {
  if (!openaiClient?.embedding) throw new Error("OpenAI embedding client is not initialized.");
  try {
    const response = await openaiClient.embedding.getEmbeddings([text]);
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate text embedding.");
  }
}

/**
 * Get a chat completion response from Azure OpenAI
 * @param {Array} messages - Array of message objects
 * @returns {Promise<string>}
 */
async function getChatCompletion(messages) {
  if (!openaiClient?.chat) throw new Error("OpenAI chat client is not initialized.");
  try {
    const response = await openaiClient.chat.getChatCompletions(messages, {
      maxTokens: 800,
      temperature: 0.7,
    });
    if (response.choices?.length > 0) {
      return response.choices[0].message.content;
    }
    throw new Error("No response from OpenAI model.");
  } catch (error) {
    console.error("Error getting chat completion:", error);
    throw new Error("Failed to get chat completion.");
  }
}

module.exports = { generateEmbedding, getChatCompletion };
