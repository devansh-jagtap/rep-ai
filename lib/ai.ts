export async function generateChatReply(prompt: string) {
  if (!prompt.trim()) {
    return "Please send a prompt.";
  }

  return `Echo: ${prompt}`;
}
