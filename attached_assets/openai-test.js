const axios = require('axios');

async function runCompletion() {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'gpt-4',  // Use gpt-3.5-turbo if gpt-4 is not available
        prompt: 'Write a welcome message for OmniFlow, our AI task automator.',
        max_tokens: 100,
      },
      {
        headers: {
          'Authorization': `Bearer sk-your-api-key-here`,  // Replace with your actual API key
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(response.data.choices[0].text);
  } catch (error) {
    console.error('Error with API request:', error.response ? error.response.data : error.message);
  }
}

runCompletion();
