# @opencode/openrouter-sdk

OpenRouter API client for multi-model AI access with streaming support.

## Installation

```bash
bun add @opencode/openrouter-sdk
```

## Usage

### Basic Chat Completion

```typescript
import { createClient } from "@opencode/openrouter-sdk"

const client = createClient(process.env.OPENROUTER_API_KEY!)

const response = await client.chat({
  messages: [{ role: "user", content: "Hello!" }],
})

console.log(response.choices[0].message.content)
```

### Streaming Responses

```typescript
const stream = client.streamChat({
  messages: [{ role: "user", content: "Write a haiku" }],
})

for await (const chunk of stream) {
  process.stdout.write(chunk)
}
```

### Model Selection

```typescript
import { getAllModels, getModel } from "@opencode/openrouter-sdk"

// Get all available models
const models = getAllModels()

// Get specific model info
const gpt4 = getModel("openai/gpt-4-turbo")
console.log(gpt4.pricing) // { prompt: 10.0, completion: 30.0 }

// Use specific model
const response = await client.chat({
  model: "anthropic/claude-3-opus",
  messages: [...]
})
```

### Usage Statistics

```typescript
// Get usage stats
const stats = client.getStats()
console.log(stats.totalRequests)
console.log(stats.totalCost)
console.log(stats.byModel)

// Reset stats
client.resetStats()
```

## Available Models

- **GPT-4 Turbo** - OpenAI's most capable model (128k context)
- **Claude 3 Opus** - Anthropic's most capable (200k context)
- **Claude 3 Sonnet** - Balanced performance (200k context)
- **Claude 3 Haiku** - Fastest Claude model (200k context)
- **Gemini Pro** - Google's multimodal AI (32k context)
- **Llama 3 70B** - Meta's open-source model (8k context)
- **Mixtral 8x7B** - Mistral's MoE model (32k context)

## Configuration

```typescript
const client = new OpenRouterClient({
  apiKey: "sk-or-v1-...",
  defaultModel: "anthropic/claude-3-sonnet",
  siteUrl: "https://myapp.com",
  siteName: "My App",
  maxRetries: 3,
  timeout: 60000,
})
```

## Error Handling

```typescript
try {
  const response = await client.chat({...})
} catch (error) {
  if (error instanceof OpenRouterError) {
    console.error(error.status, error.code, error.message)
  }
}
```

## API Reference

### `OpenRouterClient`

Main client class for interacting with OpenRouter API.

**Methods:**

- `chat(request)` - Send chat completion request
- `streamChat(request)` - Stream chat completion
- `getModels()` - Fetch available models
- `getStats()` - Get usage statistics
- `resetStats()` - Reset usage statistics

### `createClient(apiKey, config?)`

Convenience function to create a client instance.

### `getModel(modelId)`

Get information about a specific model.

### `getAllModels()`

Get all available models.

### `calculateCost(model, promptTokens, completionTokens)`

Calculate cost for a completion.

## License

MIT
