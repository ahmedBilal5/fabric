import {
  FabricChip,
  FabricIconButton,
  Link as FabricLink,
  FabricTextField,
} from "@fabric-kit/components";
import {
  controlHeight,
  iconSize,
  radii,
  shadows,
  spacing,
  zIndex,
} from "@fabric-kit/design-tokens";
import ArrowUpward from "@fabric-kit/icons/ArrowUpward";
import ChevronLeft from "@fabric-kit/icons/ChevronLeft";
import CloseOutlined from "@fabric-kit/icons/CloseOutlined";
import MinimizeOutlined from "@fabric-kit/icons/MinimizeOutlined";
import SmartToyOutlined from "@fabric-kit/icons/SmartToyOutlined";
import StopRounded from "@fabric-kit/icons/StopRounded";
import { FabricFlex, FabricStack, FabricText } from "@fabric-kit/primitives";
import {
  forwardRef,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { isAbortError } from "../helpers";
import type {
  FabricChatbotLabels,
  FabricChatbotMessage,
  FabricChatbotProps,
  FabricChatbotReply,
  FabricChatbotSendHandler,
} from "../types";

const DEFAULT_LABELS: Required<FabricChatbotLabels> = {
  title: "Assistant",
  launcherLabel: "Open assistant",
  hideLauncherLabel: "Hide assistant launcher",
  showLauncherLabel: "Show assistant launcher",
  minimizeLabel: "Minimize assistant",
  closeLabel: "Close and hide assistant",
  inputPlaceholder: "Ask a question",
  sendLabel: "Send message",
  stopLabel: "Stop answering",
  errorMessage: "Something went wrong. Please try again.",
  emptyReplyMessage: "I don't have an answer for that.",
  stoppedMessage: "Stopped",
  sourcesLabel: "Sources",
  loadingLabel: "Assistant is typing",
};

const PANEL_WIDTH = {
  xs: `calc(100vw - ${spacing.lg * 2}px)`,
  sm: 400,
} as const;

const PANEL_HEIGHT = {
  xs: "min(70vh, 520px)",
  sm: "min(75vh, 560px)",
} as const;

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function normalizeReply(reply: Awaited<ReturnType<FabricChatbotSendHandler>>): FabricChatbotReply {
  if (typeof reply === "string") return { content: reply };
  return reply ?? {};
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <FabricFlex
      gap="xs"
      align="center"
      role="status"
      aria-label={label}
      sx={{
        height: iconSize.xs,
        "& span": {
          width: spacing.sm - 2,
          height: spacing.sm - 2,
          borderRadius: `${radii.full}px`,
          backgroundColor: "var(--mui-palette-text-disabled)",
          animation: "fabricChatbotBlink 1.4s infinite both",
        },
        "@keyframes fabricChatbotBlink": {
          "0%, 80%, 100%": { opacity: 0.2 },
          "40%": { opacity: 1 },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "& span": { animation: "none", opacity: 0.6 },
        },
      }}
    >
      <span style={{ animationDelay: "0s" }} />
      <span style={{ animationDelay: "0.2s" }} />
      <span style={{ animationDelay: "0.4s" }} />
    </FabricFlex>
  );
}

interface MessageBubbleProps {
  message: FabricChatbotMessage;
  labels: Required<FabricChatbotLabels>;
  renderMessageContent?: (message: FabricChatbotMessage) => ReactNode;
}

function MessageBubble({ message, labels, renderMessageContent }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const sources = message.sources ?? [];
  const waiting = message.status === "streaming" && !message.content;

  return (
    <FabricStack
      gap="xs"
      data-role={message.role}
      sx={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "85%",
        color: isUser
          ? "var(--mui-palette-primary-contrastText)"
          : "var(--mui-palette-text-primary)",
        backgroundColor: isUser
          ? "var(--mui-palette-primary-main)"
          : "var(--mui-palette-action-hover)",
        px: `${spacing.md}px`,
        py: `${spacing.sm}px`,
        borderRadius: `${radii.lg}px`,
        borderBottomRightRadius: isUser ? `${radii.sm}px` : undefined,
        borderBottomLeftRadius: isUser ? undefined : `${radii.sm}px`,
        whiteSpace: renderMessageContent ? undefined : "pre-wrap",
        overflowWrap: "anywhere",
      }}
    >
      <FabricText textVariant="bodyMd" component="div" color="inherit">
        {waiting ? (
          <TypingIndicator label={labels.loadingLabel} />
        ) : renderMessageContent ? (
          renderMessageContent(message)
        ) : (
          message.content
        )}
      </FabricText>

      {sources.length > 0 && (
        <FabricStack gap="xs" sx={{ pt: `${spacing.xs}px` }}>
          <FabricText textVariant="bodySm" color="var(--mui-palette-text-secondary)">
            {labels.sourcesLabel}
          </FabricText>
          <FabricFlex gap="sm" wrap component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
            {sources.map((source) => (
              <li key={`${source.href}-${source.label}`}>
                <FabricLink
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ typography: "caption", color: "var(--mui-palette-primary-main)" }}
                >
                  {source.label}
                </FabricLink>
              </li>
            ))}
          </FabricFlex>
        </FabricStack>
      )}

      {message.status !== "streaming" && (
        <FabricText
          textVariant="bodySm"
          color={isUser ? "inherit" : "var(--mui-palette-text-secondary)"}
        >
          {message.status === "stopped" ? `${labels.stoppedMessage} · ` : null}
          <time dateTime={message.createdAt.toISOString()}>{formatTime(message.createdAt)}</time>
        </FabricText>
      )}
    </FabricStack>
  );
}

const FabricChatbotImpl = forwardRef<HTMLDivElement, FabricChatbotProps>(function FabricChatbot(
  {
    onSend,
    initialMessage = "Hi! How can I help you today?",
    suggestions = [],
    defaultOpen = false,
    open: openProp,
    onOpenChange,
    hideable = true,
    icon,
    renderMessageContent,
    labels: labelOverrides,
    onError,
    sx,
    ...rest
  },
  ref,
) {
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides]);
  const panelId = useId();
  const idPrefix = useId();
  const nextId = useRef(0);
  const createId = useCallback(() => {
    nextId.current += 1;
    return `${idPrefix}-${nextId.current}`;
  }, [idPrefix]);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = openProp ?? uncontrolledOpen;
  const [launcherVisible, setLauncherVisible] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<FabricChatbotMessage[]>(() =>
    initialMessage
      ? [
          {
            id: "initial",
            role: "assistant",
            content: initialMessage,
            createdAt: new Date(),
            status: "done",
          },
        ]
      : [],
  );
  const [pending, setPending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const latest = useRef({ onSend, onError, onOpenChange, labels });
  latest.current = { onSend, onError, onOpenChange, labels };

  // Stop any in-flight answer when the component unmounts.
  useEffect(() => () => controllerRef.current?.abort(), []);

  // Keep the newest message in view as answers stream in.
  useEffect(() => {
    const element = scrollRef.current;
    if (element && messages.length > 0) element.scrollTop = element.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      latest.current.onOpenChange?.(next);
    },
    [openProp],
  );

  const updateMessage = useCallback(
    (id: string, update: (message: FabricChatbotMessage) => FabricChatbotMessage) => {
      setMessages((previous) =>
        previous.map((message) => (message.id === id ? update(message) : message)),
      );
    },
    [],
  );

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || controllerRef.current) return;

      const history = messagesRef.current;
      const userMessage: FabricChatbotMessage = {
        id: createId(),
        role: "user",
        content: question,
        createdAt: new Date(),
        status: "done",
      };
      const replyId = createId();
      setMessages((previous) => [
        ...previous,
        userMessage,
        { id: replyId, role: "assistant", content: "", createdAt: new Date(), status: "streaming" },
      ]);
      setInput("");
      setPending(true);

      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const reply = normalizeReply(
          await latest.current.onSend(question, {
            signal: controller.signal,
            history,
            onToken: (token) => {
              if (controller.signal.aborted) return;
              updateMessage(replyId, (message) => ({
                ...message,
                content: message.content + token,
              }));
            },
          }),
        );
        if (controller.signal.aborted) return;
        updateMessage(replyId, (message) => {
          const content = reply.content ?? message.content;
          return {
            ...message,
            content: content || latest.current.labels.emptyReplyMessage,
            sources: reply.sources,
            status: "done",
            createdAt: new Date(),
          };
        });
      } catch (error) {
        if (controller.signal.aborted || isAbortError(error)) return;
        latest.current.onError?.(error);
        updateMessage(replyId, (message) => ({
          ...message,
          content: latest.current.labels.errorMessage,
          status: "error",
          createdAt: new Date(),
        }));
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          setPending(false);
        }
      }
    },
    [createId, updateMessage],
  );

  const stop = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    controller.abort();
    controllerRef.current = null;
    setPending(false);
    setMessages((previous) =>
      previous.map((message) =>
        message.status === "streaming"
          ? {
              ...message,
              content: message.content || latest.current.labels.emptyReplyMessage,
              status: "stopped",
              createdAt: new Date(),
            }
          : message,
      ),
    );
  }, []);

  const closePanel = (hideLauncher: boolean) => {
    setOpen(false);
    if (hideLauncher && hideable) setLauncherVisible(false);
    window.requestAnimationFrame(() => launcherRef.current?.focus());
  };

  const showSuggestions = suggestions.length > 0 && !messages.some((m) => m.role === "user");
  const launcherIcon = icon ?? <SmartToyOutlined sx={{ fontSize: iconSize["2xl"] }} />;
  const headerIcon = icon ?? (
    <SmartToyOutlined sx={{ fontSize: iconSize.md, color: "var(--mui-palette-primary-main)" }} />
  );

  if (!launcherVisible && !isOpen) {
    return (
      <FabricStack
        ref={ref}
        sx={[
          {
            position: "fixed",
            right: 0,
            bottom: `${spacing.xl}px`,
            zIndex: zIndex.modal,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest}
      >
        <FabricIconButton
          onClick={() => setLauncherVisible(true)}
          aria-label={labels.showLauncherLabel}
          sx={{
            borderRadius: `${radii.md}px 0 0 ${radii.md}px`,
            px: `${spacing.xs}px`,
            py: `${spacing.sm}px`,
            backgroundColor: "var(--mui-palette-background-paper)",
            border: "1px solid var(--mui-palette-divider)",
            borderRight: "none",
            boxShadow: shadows.sm,
          }}
        >
          <ChevronLeft sx={{ fontSize: iconSize.md, color: "var(--mui-palette-text-secondary)" }} />
        </FabricIconButton>
      </FabricStack>
    );
  }

  return (
    <FabricStack
      ref={ref}
      sx={[
        {
          position: "fixed",
          bottom: `${spacing.lg}px`,
          right: `${spacing.lg}px`,
          zIndex: zIndex.modal,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    >
      {!isOpen ? (
        <FabricStack
          sx={{
            position: "relative",
            "& .fabric-chatbot-hide": { opacity: 0, transition: "opacity 120ms" },
            "&:hover .fabric-chatbot-hide, &:focus-within .fabric-chatbot-hide": { opacity: 1 },
          }}
        >
          <FabricIconButton
            ref={launcherRef}
            onClick={() => setOpen(true)}
            aria-label={labels.launcherLabel}
            aria-expanded={false}
            aria-controls={panelId}
            sx={{
              width: controlHeight.lg + spacing.lg,
              height: controlHeight.lg + spacing.lg,
              color: "var(--mui-palette-primary-contrastText)",
              backgroundColor: "var(--mui-palette-primary-main)",
              boxShadow: shadows.panel,
              "&:hover": { backgroundColor: "var(--mui-palette-primary-dark)" },
            }}
          >
            {launcherIcon}
          </FabricIconButton>
          {hideable && (
            <FabricIconButton
              className="fabric-chatbot-hide"
              onClick={() => setLauncherVisible(false)}
              aria-label={labels.hideLauncherLabel}
              size="small"
              sx={{
                position: "absolute",
                top: `-${spacing.xs}px`,
                right: `-${spacing.xs}px`,
                p: `${spacing.xs / 2}px`,
                boxShadow: shadows.sm,
                backgroundColor: "var(--mui-palette-background-paper)",
                "&:hover": { backgroundColor: "var(--mui-palette-background-paper)" },
              }}
            >
              <CloseOutlined sx={{ fontSize: iconSize.sm }} />
            </FabricIconButton>
          )}
        </FabricStack>
      ) : (
        <FabricStack
          id={panelId}
          role="dialog"
          aria-label={labels.title}
          sx={{
            width: PANEL_WIDTH,
            height: PANEL_HEIGHT,
            backgroundColor: "var(--mui-palette-background-paper)",
            border: "1px solid var(--mui-palette-divider)",
            borderRadius: `${radii.lg}px`,
            boxShadow: shadows.panel,
            overflow: "hidden",
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              closePanel(false);
            }
          }}
        >
          <FabricFlex
            justify="space-between"
            align="center"
            sx={{
              px: `${spacing.lg}px`,
              py: `${spacing.sm}px`,
              borderBottom: "1px solid var(--mui-palette-divider)",
            }}
          >
            <FabricFlex align="center" gap="sm">
              {headerIcon}
              <FabricText textVariant="uiMd" component="h2" sx={{ m: 0 }}>
                {labels.title}
              </FabricText>
            </FabricFlex>

            <FabricFlex align="center" gap="xs">
              <FabricIconButton
                onClick={() => closePanel(false)}
                aria-label={labels.minimizeLabel}
                size="small"
              >
                <MinimizeOutlined sx={{ fontSize: iconSize.md }} />
              </FabricIconButton>
              {hideable && (
                <FabricIconButton
                  onClick={() => closePanel(true)}
                  aria-label={labels.closeLabel}
                  size="small"
                >
                  <CloseOutlined sx={{ fontSize: iconSize.md }} />
                </FabricIconButton>
              )}
            </FabricFlex>
          </FabricFlex>

          <FabricStack
            ref={scrollRef}
            gap="sm"
            role="log"
            aria-live="polite"
            aria-busy={pending}
            sx={{ flex: 1, overflowY: "auto", p: `${spacing.lg}px` }}
          >
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                labels={labels}
                renderMessageContent={renderMessageContent}
              />
            ))}
            {showSuggestions && (
              <FabricFlex gap="sm" wrap sx={{ pt: `${spacing.sm}px` }}>
                {suggestions.map((suggestion) => (
                  <FabricChip
                    key={suggestion}
                    label={suggestion}
                    variant="outlined"
                    onClick={() => void send(suggestion)}
                  />
                ))}
              </FabricFlex>
            )}
          </FabricStack>

          <FabricFlex
            component="form"
            gap="sm"
            align="center"
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
            sx={{
              p: `${spacing.md}px`,
              borderTop: "1px solid var(--mui-palette-divider)",
            }}
          >
            <FabricTextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder={labels.inputPlaceholder}
              value={input}
              inputRef={inputRef}
              onChange={(event) => setInput(event.target.value)}
              slotProps={{ htmlInput: { "aria-label": labels.inputPlaceholder } }}
            />
            {pending ? (
              <FabricIconButton type="button" onClick={stop} aria-label={labels.stopLabel}>
                <StopRounded sx={{ fontSize: iconSize.lg }} />
              </FabricIconButton>
            ) : (
              <FabricIconButton
                type="submit"
                disabled={!input.trim()}
                aria-label={labels.sendLabel}
                sx={{
                  color: "var(--mui-palette-primary-contrastText)",
                  backgroundColor: "var(--mui-palette-primary-main)",
                  "&:hover": { backgroundColor: "var(--mui-palette-primary-dark)" },
                  "&.Mui-disabled": {
                    color: "var(--mui-palette-action-disabled)",
                    backgroundColor: "var(--mui-palette-action-disabledBackground)",
                  },
                }}
              >
                <ArrowUpward sx={{ fontSize: iconSize.md }} />
              </FabricIconButton>
            )}
          </FabricFlex>
        </FabricStack>
      )}
    </FabricStack>
  );
});

FabricChatbotImpl.displayName = "FabricChatbot";

/**
 * Floating assistant launcher and chat panel. Bring your own backend: pass an
 * `onSend` function that streams tokens with `onToken` or resolves with the answer.
 *
 * @example
 * ```tsx
 * <FabricChatbot
 *   suggestions={["How do I reset my password?"]}
 *   onSend={async (question, { signal, onToken }) => {
 *     const res = await fetch("/api/chat", { method: "POST", body: question, signal });
 *     await readTextStream(res.body!, onToken);
 *   }}
 * />
 * ```
 */
export const FabricChatbot = memo(FabricChatbotImpl);
