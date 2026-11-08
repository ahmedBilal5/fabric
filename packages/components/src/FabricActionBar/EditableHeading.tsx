import DoneOutlinedIcon from "@fabric-kit/icons/DoneOutlined";
import { Box, CircularProgress, InputAdornment } from "@mui/material";
import type React from "react";
import { useState } from "react";
import { FabricTextField } from "../FabricTextField/FabricTextField";

export interface EditableHeadingProps {
  text: string;
  onEditComplete: (newText: string) => unknown | Promise<unknown>;
  onCancel: () => void;
}

// Editable-heading flow: submit on Enter or on the check-icon click,
// disable input while saving, spinner replaces check icon during save.
export function EditableHeading({ text, onEditComplete, onCancel }: EditableHeadingProps) {
  const [value, setValue] = useState(text);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onEditComplete(value);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <FabricTextField
      autoFocus
      value={value}
      disabled={saving}
      onChange={(ev) => setValue(ev.target.value)}
      onKeyDown={handleKeyDown}
      height="auto"
      variant="outlined"
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Box
                onClick={submit}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: saving ? "default" : "pointer",
                }}
              >
                {saving ? (
                  <CircularProgress size={14} sx={{ opacity: 0.7 }} />
                ) : (
                  <DoneOutlinedIcon sx={{ fontSize: 18 }} />
                )}
              </Box>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
