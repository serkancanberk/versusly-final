// Sanitize user input to remove potentially dangerous characters and handle non-string inputs safely
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    console.error("sanitizeInput: input is not a string", input);
    return '';
  }
  return input.replace(/[\r\n]+/g, ' ').trim();
};

// Format the OpenAI API response into a usable structure for the frontend
export const formatGPTResponse = (response) => {
  return {
    content: response?.choices?.[0]?.message?.content || '',
    usage: response?.usage || {}
  };
};

// Generate a structured prompt from form inputs
export const generatePromptFromForm = (title, statement, tags = []) => {
  return `
    Given the following debate input:
    Title: ${title}
    Statement: ${statement}
    Tags: ${tags.join(', ')}

    Please provide a balanced and insightful analysis in markdown format.
  `;
};

// Generate a critique prompt based on a full VS content
export const generateCritiquePrompt = ({ title, statement, arguments: args = [] }) => {
  return `
    Based on the following debate titled "${title}", please analyze the arguments and provide a detailed critique in markdown format.

    Statement:
    ${statement}

    Arguments:
    ${args.map((arg, i) => `Argument ${i + 1}: ${arg}`).join('\n')}

    Focus on the strength, clarity, and relevance of each argument, and suggest improvements where necessary.
  `;
};
