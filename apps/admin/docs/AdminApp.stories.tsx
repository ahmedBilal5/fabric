import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { AdminApp, preloadPages } from "../src/AdminApp";
import { DataProvider } from "../src/data/store";
import { RouterProvider } from "../src/router";

// A fixed "today", so the generated customers and charts are the same on every run.
const TODAY = new Date(2026, 10, 12);

/** The whole app at a path. Routing stays in memory, so links don't change Storybook's URL. */
function Demo({ path = "/" }: { path?: string }) {
  return (
    <DataProvider latency={150} today={TODAY}>
      <RouterProvider mode="memory" initialLocation={path}>
        <AdminApp showThemeToggle={false} syncDocumentTitle={false} />
      </RouterProvider>
    </DataProvider>
  );
}

const meta = {
  title: "Examples/Admin app",
  component: Demo,
  tags: ["test"],
  parameters: { layout: "fullscreen" },
  // Pages load on demand in the app. Load them all first so stories show content at once.
  loaders: [
    async () => {
      await preloadPages();
      return {};
    },
  ],
} satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;

const body = () => within(document.body);

/** Revenue, customers and sign-ups for a date range, from `FabricDashboardPage`. */
export const Dashboard: Story = {
  args: { path: "/" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Each page loads on demand, so wait for it.
    await expect(
      await canvas.findByRole("heading", { level: 1, name: "Dashboard" }, { timeout: 3000 }),
    ).toBeVisible();
    await expect(await canvas.findByRole("link", { name: /Monthly recurring revenue/ })).toBeVisible();
  },
};

/** Every customer, with search, filters, export and bulk delete, from `FabricListPage`. */
export const Customers: Story = { args: { path: "/customers" } };

/** Filters live in the URL, so this link opens the list already filtered. */
export const FilteredCustomers: Story = {
  args: { path: "/customers?status=past_due&plan=growth" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText(/^\d+ results?$/)).toBeVisible());
    for (const cell of canvas.getAllByRole("gridcell", { name: /Past due|Active|Trial|Churned/ }))
      await expect(cell).toHaveTextContent("Past due");
  },
};

/** One customer: summary, invoices, usage and activity, from `FabricDetailPage`. */
export const Customer: Story = { args: { path: "/customers/c-1010" } };

/** A create form with validation and a live price, from `FabricFormPage`. */
export const NewCustomer: Story = { args: { path: "/customers/new" } };

/** The same form, filled in from the record. */
export const EditCustomer: Story = { args: { path: "/customers/c-1010/edit" } };

/** Profile, workspace, appearance and notifications, from `FabricSettingsPage`. */
export const Settings: Story = { args: { path: "/settings/workspace" } };

/** Unknown paths and deleted records show `FabricSystemPage`. */
export const NotFound: Story = {
  args: { path: "/customers/c-9999" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("heading", { name: "We couldn't find that customer" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Back to customers" })).toBeVisible();
  },
};

/** On phones the sidebar starts closed and opens from the menu button. */
export const Mobile: Story = {
  args: { path: "/" },
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/**
 * The sidebar and links move between pages. Focus moves to each new page's heading,
 * so screen readers announce where you are.
 */
export const Navigation: Story = {
  args: { path: "/" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The sidebar link (on record pages the breadcrumb is a second "Customers" link).
    const sidebarLink = () => canvas.getAllByRole("link", { name: "Customers" })[0];
    await userEvent.click(sidebarLink());
    const heading = await canvas.findByRole("heading", { level: 1, name: "Customers" });
    await waitFor(() => expect(heading).toHaveFocus());

    await userEvent.type(canvas.getByRole("textbox", { name: "Search customers" }), "initech logistics");
    await waitFor(() => expect(canvas.getByText("1 result")).toBeVisible());
    await userEvent.click(canvas.getByRole("link", { name: "Initech Logistics" }));
    await expect(await canvas.findByRole("heading", { level: 1, name: "Initech Logistics" })).toBeVisible();

    await userEvent.click(canvas.getByRole("tab", { name: "Usage" }));
    await expect(canvas.getByRole("meter", { name: /Seats in use/ })).toBeVisible();

    await userEvent.click(sidebarLink());
    await expect(await canvas.findByRole("heading", { level: 1, name: "Customers" })).toBeVisible();
  },
};

/** Saving a new customer adds it and opens its page. A blank form lists what's missing first. */
export const CreateACustomer: Story = {
  args: { path: "/customers/new" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Add customer" }));
    // The message shows in the error summary and under the field.
    await expect(await canvas.findAllByText(/Enter the company name/)).toHaveLength(2);

    await userEvent.type(canvas.getByRole("textbox", { name: "Company name" }), "Lakeside Bakery");
    await userEvent.click(canvas.getByRole("combobox", { name: "Industry" }));
    await userEvent.click(await body().findByRole("option", { name: "Retail" }));
    await userEvent.click(canvas.getByRole("combobox", { name: "Region" }));
    await userEvent.click(await body().findByRole("option", { name: "Europe" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "Contact name" }), "Mia Lund");
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "mia@lakeside.example.com");
    await userEvent.click(canvas.getByRole("button", { name: "Add customer" }));

    await expect(
      await canvas.findByRole("heading", { level: 1, name: "Lakeside Bakery" }, { timeout: 3000 }),
    ).toBeVisible();
    await expect(canvas.getByText("created the account")).toBeVisible();
  },
};

/** Editing the plan updates the record and its activity. */
export const EditAndSave: Story = {
  args: { path: "/customers/c-1010/edit" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("radio", { name: /Enterprise/ }));
    await expect(canvas.getByText(/on Enterprise at \$40 each/)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(await canvas.findByText("changed the plan to", {}, { timeout: 3000 })).toBeVisible();
    await expect(canvas.getByText(/^Enterprise plan/)).toBeVisible();
  },
};
