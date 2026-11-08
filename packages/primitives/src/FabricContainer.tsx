import { Container as MuiContainer, type ContainerProps as MuiContainerProps } from "@mui/material";
import React from "react";

export interface FabricContainerProps extends MuiContainerProps {}

/** Max-width content wrapper. Passthrough to MUI `Container`. */
export const FabricContainer = React.forwardRef<HTMLDivElement, FabricContainerProps>(
  function FabricContainer(props, ref) {
    return <MuiContainer ref={ref} {...props} />;
  },
);
