# Lemonade in ForgeMind AI

ForgeMind v0.9.1 is designed around a prompt-first workflow and supports Lemonade as the default local AI engine.

## Default local endpoint
`http://127.0.0.1:13305/v1`

ForgeMind can:
- detect available local models;
- automatically use the first detected model when the model field is empty;
- send prompts through an OpenAI-compatible `/chat/completions` endpoint;
- work without a cloud API key when using the local Lemonade engine.

## Cloud mode
Switch **Settings → AI engine** to **Cloud API (your key)** to use an OpenAI-compatible provider. The API key is stored with Electron OS secure storage when available.

## Important
Do not open `src/index.html` directly in a web browser. ForgeMind's `window.forge` bridge is provided by Electron. Use `START-FORGEMIND-WINDOWS.bat`.
