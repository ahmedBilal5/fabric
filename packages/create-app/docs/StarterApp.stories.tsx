import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { App, preloadPages } from "../template/src/App";
import { ProjectsProvider } from "../template/src/data";
import { RouterProvider } from "../template/src/router";

/** The app `@fabric-kit/create-app` makes, at a path. Routing stays in memory. */
function Starter({ path = "/" }: { path?: string }) {
  return (
    <ProjectsProvider>
      <RouterProvider mode="memory" initialLocation={path}>
        <App showThemeToggle={false} />
      </RouterProvider>
    </ProjectsProvider>
  );
}

const meta = {
  title: "Examples/Starter app",
  component: Starter,
  tags: ["test"],
  parameters: { layout: "fullscreen" },
  // Pages load on demand in the app. Load them all first so stories show content at once.
  loaders: [
    async () => {
      await preloadPages();
      return {};
    },
  ],
} satisfies Meta<typeof Starter>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The home page: stat cards, a chart and meters. */
export const Home: Story = { args: { path: "/" } };

/** A list page with search, filters and bulk delete. */
export const Projects: Story = { args: { path: "/projects" } };

/** A detail page with a summary and tabs. */
export const Project: Story = { args: { path: "/projects/p-101" } };

/** A create form with validation. */
export const NewProject: Story = { args: { path: "/projects/new" } };

/** A settings page. */
export const Settings: Story = { args: { path: "/settings" } };

/** The 404 page. */
export const NotFound: Story = { args: { path: "/nowhere" } };

/** Create a project: the form checks what's missing, then saves and opens the new project. */
export const CreateAProject: Story = {
  args: { path: "/projects/new" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Each page loads on demand, so wait for the form before using it.
    await userEvent.click(await canvas.findByRole("button", { name: "Create project" }));
    // The message shows in the error summary and under the field.
    await expect(await canvas.findAllByText(/Enter a project name/)).toHaveLength(2);

    await userEvent.type(canvas.getByRole("textbox", { name: "Project name" }), "Brand refresh");
    await userEvent.type(canvas.getByRole("textbox", { name: "Client" }), "Acme Corporation");
    await userEvent.type(canvas.getByLabelText("Budget"), "12000");
    const due = canvas.getByRole("group", { name: "Due date" });
    await userEvent.click(due);
    await userEvent.keyboard("03152027");
    await userEvent.click(canvas.getByRole("button", { name: "Create project" }));

    await expect(
      await canvas.findByRole("heading", { level: 1, name: "Brand refresh" }, { timeout: 3000 }),
    ).toBeVisible();
    await userEvent.click(canvas.getAllByRole("link", { name: "Projects" })[0]);
    await waitFor(() => expect(canvas.getByRole("link", { name: "Brand refresh" })).toBeVisible());
  },
};
