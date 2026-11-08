# @fabric-kit/chatbot

A floating assistant launcher and chat panel for React apps using [Fabric](https://ahmedbilal5.github.io/fabric/). Works with any backend: you provide one async function.

```bash
pnpm add @fabric-kit/chatbot @fabric-kit/theme @mui/material @emotion/react @emotion/styled
```

```tsx
import { FabricChatbot, readTextStream } from "@fabric-kit/chatbot";

<FabricChatbot
  suggestions={["How do I reset my password?"]}
  onSend={async (question, { signal, onToken }) => {
    const res = await fetch("/api/chat", { method: "POST", body: question, signal });
    await readTextStream(res.body!, onToken);
  }}
/>;
```

Features: token streaming, a stop button, starter suggestions, source links, error handling, controlled or uncontrolled open state, custom labels, custom message rendering, and keyboard and screen-reader support.

## Exports

| Export                 | Kind      | Purpose                                                         |
| ---------------------- | --------- | --------------------------------------------------------------- |
| `FabricChatbot`        | component | Launcher and chat panel.                                        |
| `readTextStream`       | helper    | Streams a plain-text `fetch` response into `onToken`.           |
| `readServerSentEvents` | helper    | Reads an SSE response and hands you each event's `data`.        |
| `isAbortError`         | helper    | True for the error thrown when a request is aborted.            |
| `FabricChatbot*` types | types     | Props, messages, sources, labels and the `onSend` handler type. |

Full docs: [Kits → Chatbot](https://ahmedbilal5.github.io/fabric/docs/?path=/docs/kits-chatbot-overview--docs).

## License

MIT
