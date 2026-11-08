import type { FabricStack } from "@fabric-kit/primitives";
import type { ComponentProps, ComponentPropsWithoutRef, ReactNode } from "react";

/** Who wrote a message. */
export type FabricChatbotRole = "user" | "assistant";

/** Lifecycle of an assistant message. User messages are always `"done"`. */
export type FabricChatbotMessageStatus = "streaming" | "done" | "stopped" | "error";

/** A link shown under an assistant answer, e.g. a doc the answer was based on. */
export interface FabricChatbotSource {
  /** Visible link text. */
  label: string;
  /** Link target. Opens in a new tab. */
  href: string;
}

/** One message in the conversation. */
export interface FabricChatbotMessage {
  /** Stable id, unique within the conversation. */
  id: string;
  /** Who wrote the message. */
  role: FabricChatbotRole;
  /** Message text. Rendered as plain text unless `renderMessageContent` is set. */
  content: string;
  /** When the message was created. */
  createdAt: Date;
  /** Assistant message state. */
  status: FabricChatbotMessageStatus;
  /** Links shown under an assistant answer. */
  sources?: FabricChatbotSource[];
}

/** Second argument passed to `onSend`. */
export interface FabricChatbotSendContext {
  /** Aborted when the user presses stop or the component unmounts. Pass it to `fetch`. */
  signal: AbortSignal;
  /** Append streamed text to the assistant's answer. Call it as tokens arrive. */
  onToken: (token: string) => void;
  /** The conversation before this question, oldest first. Useful for chat APIs. */
  history: readonly FabricChatbotMessage[];
}

/** What `onSend` may resolve with once the answer is complete. */
export interface FabricChatbotReply {
  /** Full answer text. Replaces any streamed text. Omit it if you streamed with `onToken`. */
  content?: string;
  /** Links to show under the answer. */
  sources?: FabricChatbotSource[];
}

/**
 * Sends a question to your backend. Stream the answer with `context.onToken`,
 * or resolve with the full answer as a string or `FabricChatbotReply`.
 */
export type FabricChatbotSendHandler = (
  question: string,
  context: FabricChatbotSendContext,
  // biome-ignore lint/suspicious/noConfusingVoidType: lets `async () => { ... }` handlers that return nothing type-check.
) => Promise<FabricChatbotReply | string | undefined | void>;

/** User-facing text. Override any of it to translate or rebrand the chatbot. */
export interface FabricChatbotLabels {
  /** Panel title. Default "Assistant". */
  title?: string;
  /** Accessible name of the launcher button. */
  launcherLabel?: string;
  /** Accessible name of the small "hide launcher" button. */
  hideLauncherLabel?: string;
  /** Accessible name of the edge tab that brings the launcher back. */
  showLauncherLabel?: string;
  /** Accessible name of the minimize button. */
  minimizeLabel?: string;
  /** Accessible name of the close button. */
  closeLabel?: string;
  /** Composer placeholder and accessible name. */
  inputPlaceholder?: string;
  /** Accessible name of the send button. */
  sendLabel?: string;
  /** Accessible name of the stop button shown while an answer streams. */
  stopLabel?: string;
  /** Shown when `onSend` throws. */
  errorMessage?: string;
  /** Shown when `onSend` finishes without any text. */
  emptyReplyMessage?: string;
  /** Shown under an answer the user stopped. */
  stoppedMessage?: string;
  /** Heading above source links. */
  sourcesLabel?: string;
  /** Accessible name of the typing indicator. */
  loadingLabel?: string;
}

/** Props for `FabricChatbot`. */
export interface FabricChatbotProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children" | "onError"> {
  /** Sends a question to your backend. See `FabricChatbotSendHandler`. */
  onSend: FabricChatbotSendHandler;
  /** First assistant message. Pass an empty string for none. */
  initialMessage?: string;
  /** Starter questions shown as chips before the user asks anything. */
  suggestions?: string[];
  /** Open the panel on mount. Ignored when `open` is set. */
  defaultOpen?: boolean;
  /** Controlled open state of the panel. */
  open?: boolean;
  /** Called when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Let users hide the launcher behind a small edge tab. Default `true`. */
  hideable?: boolean;
  /** Launcher and header icon. Defaults to a robot icon. */
  icon?: ReactNode;
  /** Render message text yourself, e.g. with a Markdown renderer. */
  renderMessageContent?: (message: FabricChatbotMessage) => ReactNode;
  /** User-facing text overrides. */
  labels?: FabricChatbotLabels;
  /** Called when `onSend` throws (not when the user stops an answer). */
  onError?: (error: unknown) => void;
  /** Styles for the fixed-position root, e.g. to move it: `{ right: 'auto', left: 24 }`. */
  sx?: ComponentProps<typeof FabricStack>["sx"];
}
