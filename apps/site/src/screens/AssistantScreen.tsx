import { FabricChatbot, type FabricChatbotSendHandler } from "@fabric-kit/chatbot";
import { FabricBreadcrumbs, FabricDivider } from "@fabric-kit/components";
import { FabricStack, FabricText } from "@fabric-kit/primitives";

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

// Canned answers stand in for a real model in this concept screen.
const ANSWERS: Record<string, string> = {
  refund:
    "Open the order, choose Refund, and pick the items to return. The customer gets an email right away, and the money arrives in 3 to 5 business days.",
  export:
    "Go to Reports, pick a date range, then Export. You can download a CSV or schedule a weekly email to your team.",
};

const sendDemo: FabricChatbotSendHandler = async (question, { signal, onToken }) => {
  await wait(500, signal);
  const answer = /refund/i.test(question)
    ? ANSWERS.refund
    : /export|report|csv/i.test(question)
      ? ANSWERS.export
      : "In this demo I only know about refunds and exports. Connect `onSend` to your own model to answer anything.";
  for (const word of answer.split(/(?<= )/)) {
    await wait(45, signal);
    onToken(word);
  }
  return { sources: [{ label: "Help center", href: "https://example.com/help" }] };
};

/** Concept screen: a help article with the Fabric assistant open beside it. */
export function AssistantScreen() {
  return (
    <FabricStack
      sx={{ height: "100%", bgcolor: "background.paper", p: 4, pr: { md: "460px" } }}
      gap="md"
    >
      <FabricBreadcrumbs
        items={[{ label: "Help center", href: "#assistant" }, { label: "Orders" }]}
      />
      <FabricText textVariant="headingLg" component="h3" sx={{ m: 0 }}>
        Managing orders
      </FabricText>
      <FabricText textVariant="bodyMd" color="text.secondary">
        Track every order from checkout to delivery: change items, send updates and handle returns
        from one place.
      </FabricText>
      <FabricDivider />
      <FabricText textVariant="headingSm" component="h4" sx={{ m: 0 }}>
        Edit an order
      </FabricText>
      <FabricText textVariant="bodyMd">
        Orders can be edited until they ship. Open the order, change quantities or the address, and
        save.
      </FabricText>
      <FabricChatbot
        defaultOpen
        hideable={false}
        initialMessage="Hi Jane. Ask me anything about your store."
        suggestions={["How do I refund an order?", "Can I export a sales report?"]}
        onSend={sendDemo}
      />
    </FabricStack>
  );
}
