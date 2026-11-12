import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import type { InputKind } from "./examples";

/** Exercise each input through its public UI, then confirm submission and reset. */
export async function exerciseBinding(canvasElement: HTMLElement, kind: InputKind) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Focus field" }));
  await expect(canvasElement.contains(document.activeElement)).toBe(true);
  await expect(canvas.getByRole("button", { name: "Focus field" })).not.toHaveFocus();
  let expected: unknown;
  switch (kind) {
    case "TextField":
    case "Field":
      await userEvent.type(canvas.getByRole("textbox"), "Northwind");
      expected = "Northwind";
      break;
    case "Select":
      await userEvent.click(canvas.getByRole("combobox"));
      await userEvent.click(await screen.findByRole("option", { name: "Express" }));
      expected = "express";
      break;
    case "Checkbox":
    case "Switch": {
      const input = canvas.getByTitle("Consumer input slot");
      await userEvent.keyboard(" ");
      await expect(input).toBeChecked();
      expected = true;
      break;
    }
    case "Radio":
    case "RadioGroup":
      await userEvent.click(canvas.getByRole("radio", { name: "Standard" }));
      await userEvent.keyboard("{ArrowRight}");
      await expect(canvas.getByRole("radio", { name: "Express" })).toBeChecked();
      expected = "express";
      break;
    case "ToggleButtonGroup":
      await userEvent.click(canvas.getByRole("button", { name: "Express" }));
      await expect(canvas.getByRole("button", { name: "Express" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expected = "express";
      break;
    case "Autocomplete":
      await userEvent.type(canvas.getByRole("combobox"), "North");
      await screen.findByRole("option", { name: "Northwind" });
      await userEvent.keyboard("{ArrowDown}{Enter}");
      expected = { id: "northwind", name: "Northwind" };
      break;
    case "CheckboxGroup":
      await userEvent.click(canvas.getByRole("checkbox", { name: "Standard" }));
      await userEvent.click(canvas.getByRole("checkbox", { name: "Express" }));
      await userEvent.click(canvas.getByRole("checkbox", { name: "Standard" }));
      expected = ["express"];
      break;
    case "DatePicker":
    case "DateTimePicker":
    case "TimePicker":
    case "DateRangePicker":
      await userEvent.click(canvas.getByRole("button", { name: "Load sample" }));
      // MUI X exposes editable segments as spinbuttons, rather than a textbox.
      await waitFor(() =>
        expect(
          canvas
            .getAllByRole("spinbutton")
            .some((segment) => segment.textContent === (kind === "TimePicker" ? "30" : "2026")),
        ).toBe(true),
      );
      expected =
        kind === "DateRangePicker"
          ? { start: new Date(2026, 10, 15), end: new Date(2026, 10, 18) }
          : new Date(2026, 10, 15, 9, 30);
      break;
  }
  await userEvent.click(canvas.getByRole("button", { name: "Save" }));
  await waitFor(() =>
    expect(canvas.getByRole("status")).toHaveTextContent(JSON.stringify(expected)),
  );
  await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
  await expect(canvas.getByRole("status")).toHaveTextContent("No submission yet");
  if (kind === "TextField" || kind === "Field")
    await expect(canvas.getByRole("textbox")).toHaveValue("");
  if (kind === "Checkbox" || kind === "Switch")
    await expect(canvas.getByTitle("Consumer input slot")).not.toBeChecked();
}
