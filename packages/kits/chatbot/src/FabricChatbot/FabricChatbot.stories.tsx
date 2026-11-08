import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import type { FabricChatbotSendHandler, FabricChatbotSource } from "../types";
import { FabricChatbot } from "./FabricChatbot";

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

const sources: FabricChatbotSource[] = [
  { label: "Resetting your password", href: "https://example.com/help/password" },
  { label: "Account security", href: "https://example.com/help/security" },
];

/** Fakes a streaming backend: splits a canned answer into words. */
function streamingReply(answer: string, delay = 60): FabricChatbotSendHandler {
  return async (_question, { signal, onToken }) => {
    await wait(400, signal);
    for (const word of answer.split(/(?<= )/)) {
      await wait(delay, signal);
      onToken(word);
    }
    return { sources };
  };
}

const ANSWER =
  "Go to Settings → Security and choose Reset password. We'll email you a link " +
  "that stays valid for 30 minutes. If it doesn't arrive, check your spam folder.";

const meta = {
  title: "Kits/Chatbot/FabricChatbot",
  component: FabricChatbot,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, iframeHeight: 640 },
      description: {
        component:
          "A floating assistant launcher and chat panel. It works with any backend: " +
          "you pass `onSend`, which streams the answer with `onToken` or resolves with it.",
      },
    },
  },
  args: {
    onSend: streamingReply(ANSWER),
    suggestions: ["How do I reset my password?", "Where can I find my invoices?"],
    onError: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof FabricChatbot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed by default. Hover the launcher to reveal the hide button. */
export const Launcher: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Open assistant" })).toBeVisible();
  },
};

/** Streams an answer word by word, then shows source links. */
export const StreamingAnswer: Story = {
  args: { defaultOpen: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Ask a question"), "How do I reset my password?");
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await expect(await canvas.findByText(/check your spam folder/, {}, { timeout: 5000 })).toBeVisible();
    await expect(await canvas.findByRole("link", { name: "Account security" })).toBeVisible();
  },
};

/** Suggestions disappear once the user asks something. */
export const Suggestions: Story = {
  args: { defaultOpen: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Where can I find my invoices?" }));
    await waitFor(() =>
      expect(canvas.queryByRole("button", { name: "How do I reset my password?" })).toBeNull(),
    );
  },
};

/** Resolve with a string when your API doesn't stream. */
export const NonStreaming: Story = {
  args: {
    defaultOpen: true,
    suggestions: [],
    onSend: async (_question, { signal }) => {
      await wait(800, signal);
      return "Invoices live under Billing → History. You can download each one as a PDF.";
    },
  },
};

/** Press the stop button while an answer streams. The partial answer is kept. */
export const StopAnswer: Story = {
  args: { defaultOpen: true, onSend: streamingReply(ANSWER, 250) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Ask a question"), "Reset password");
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Stop answering" }));
    await expect(await canvas.findByText(/Stopped/)).toBeVisible();
  },
};

/** When `onSend` throws, the answer shows an error and `onError` is called. */
export const ErrorState: Story = {
  args: {
    defaultOpen: true,
    onSend: async () => {
      throw new Error("Network failure");
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Ask a question"), "Hello");
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await expect(await canvas.findByText("Something went wrong. Please try again.")).toBeVisible();
    await expect(args.onError).toHaveBeenCalled();
  },
};

/** Rename and translate any text with `labels`. */
export const CustomLabels: Story = {
  args: {
    defaultOpen: true,
    initialMessage: "Hola. ¿En qué puedo ayudarte?",
    suggestions: ["¿Cómo cambio mi contraseña?"],
    labels: {
      title: "Asistente",
      inputPlaceholder: "Escribe una pregunta",
      sendLabel: "Enviar",
      sourcesLabel: "Fuentes",
    },
  },
};

/** Without `hideable`, there is no hide or close-and-hide button. */
export const NotHideable: Story = {
  args: { hideable: false },
};
