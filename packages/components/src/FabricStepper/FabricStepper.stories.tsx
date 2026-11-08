import { Box, Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { FabricButton } from "../FabricButton";
import { FabricStepper, type FabricStepperProps } from ".";

const meta: Meta<FabricStepperProps> = {
  title: "Components/FabricStepper",
  component: FabricStepper,
  tags: ["test"],
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    alternativeLabel: { control: "boolean" },
    nonLinear: { control: "boolean" },
  },
  args: {
    orientation: "horizontal",
    alternativeLabel: true,
    nonLinear: false,
    activeStep: 1,
    steps: [
      { label: "Select source" },
      { label: "Configure schema" },
      { label: "Review and submit" },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          "Wizard rail — data-driven wrapper over MUI Stepper. Accepts a steps array with per-item label, description, icon, completed, disabled, error, and (vertical only) content.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Box sx={{ width: "100%", maxWidth: 700 }}>
      <FabricStepper {...args} />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // All three step labels from meta.args render.
    await expect(canvas.getByText("Select source")).toBeInTheDocument();
    await expect(canvas.getByText("Configure schema")).toBeInTheDocument();
    await expect(canvas.getByText("Review and submit")).toBeInTheDocument();
  },
};

export const Vertical: Story = {
  render: () => (
    <Box sx={{ width: "100%", maxWidth: 500 }}>
      <FabricStepper
        orientation="vertical"
        activeStep={1}
        steps={[
          {
            label: "Select source",
            description: "Pick the data source to sync from.",
            content: <Typography variant="body2">Source picker content lives here.</Typography>,
          },
          {
            label: "Configure schema",
            description: "Map fields and set sync rules.",
            content: <Typography variant="body2">Schema configuration content.</Typography>,
          },
          {
            label: "Review",
            description: "Confirm your setup.",
            content: <Typography variant="body2">Review before submit.</Typography>,
          },
        ]}
      />
    </Box>
  ),
};

export const WithDescriptions: Story = {
  name: "With optional descriptions",
  render: () => (
    <Box sx={{ width: "100%", maxWidth: 700 }}>
      <FabricStepper
        activeStep={1}
        alternativeLabel
        steps={[
          { label: "Details", description: "Basic information" },
          { label: "Approvers", description: "Set approval chain" },
          { label: "Review", description: "Confirm and submit" },
        ]}
      />
    </Box>
  ),
};

export const Interactive: Story = {
  name: "Interactive (nonLinear + onStepClick)",
  render: () => {
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState<Record<number, boolean>>({});
    const stepDefs = [
      { label: "Details" },
      { label: "Mapping" },
      { label: "Schedule" },
      { label: "Review" },
    ];
    const steps = stepDefs.map((s, i) => ({ ...s, completed: !!completed[i] }));
    const isLast = activeStep === stepDefs.length - 1;
    const handleNext = () => {
      setCompleted({ ...completed, [activeStep]: true });
      setActiveStep((s) => Math.min(s + 1, stepDefs.length - 1));
    };
    return (
      <Box sx={{ width: "100%", maxWidth: 700 }}>
        <FabricStepper
          nonLinear
          activeStep={activeStep}
          steps={steps}
          onStepClick={setActiveStep}
        />
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: "flex-end" }}>
          <FabricButton
            variant="outlined"
            disabled={activeStep === 0}
            onClick={() => setActiveStep((s) => Math.max(s - 1, 0))}
          >
            Back
          </FabricButton>
          <FabricButton variant="contained" onClick={handleNext}>
            {isLast ? "Finish" : "Next"}
          </FabricButton>
        </Stack>
      </Box>
    );
  },
};

export const ErrorState: Story = {
  name: "Step in error state",
  render: () => (
    <Box sx={{ width: "100%", maxWidth: 700 }}>
      <FabricStepper
        activeStep={1}
        steps={[
          { label: "Connect", completed: true },
          { label: "Validate", description: "Schema mismatch detected", error: true },
          { label: "Import" },
        ]}
      />
    </Box>
  ),
};

export const DisabledStep: Story = {
  name: "Disabled step",
  render: () => (
    <Box sx={{ width: "100%", maxWidth: 700 }}>
      <FabricStepper
        nonLinear
        activeStep={0}
        onStepClick={() => {}}
        steps={[
          { label: "Details" },
          { label: "Premium (locked)", disabled: true },
          { label: "Review" },
        ]}
      />
    </Box>
  ),
};

export const AllStepsComplete: Story = {
  name: "All steps complete",
  render: () => (
    <Box sx={{ width: "100%", maxWidth: 700 }}>
      <FabricStepper
        activeStep={3}
        steps={[
          { label: "Details", completed: true },
          { label: "Mapping", completed: true },
          { label: "Schedule", completed: true },
        ]}
      />
    </Box>
  ),
};
