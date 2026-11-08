import { useMemo, useState } from "react";

import type { FabricCanvasValidationWidgetProps } from "../types";
import { FabricCanvasValidationPopover } from "./FabricCanvasValidationPopover";
import { FabricCanvasValidationTrigger } from "./FabricCanvasValidationTrigger";
import { getValidationSummary } from "./validationUtils";

export const FabricCanvasValidationWidget = ({
  popoverId,
  activePopoverId,
  onActivePopoverChange,
  groups,
  validationStatus,
  nodeIdScope,
  iconSize,
  disableAccordion,
  readOnly,
  renderNodeIcon,
  renderValidationItem,
}: FabricCanvasValidationWidgetProps) => {
  const [anchorElement, setAnchorElement] = useState<Element | null>(null);

  const scopedGroups = useMemo(
    () => (nodeIdScope ? groups.filter((group) => group.nodeId === nodeIdScope) : groups),
    [groups, nodeIdScope],
  );

  const summary = useMemo(() => getValidationSummary(scopedGroups), [scopedGroups]);

  return (
    <>
      <FabricCanvasValidationTrigger
        summary={summary}
        validationStatus={validationStatus}
        nodeScoped={Boolean(nodeIdScope)}
        popoverId={popoverId}
        activePopoverId={activePopoverId}
        onActivePopoverChange={onActivePopoverChange}
        iconSize={iconSize}
        onAnchorElementChange={setAnchorElement}
      />
      <FabricCanvasValidationPopover
        open={activePopoverId === popoverId}
        onClose={() => onActivePopoverChange(null)}
        anchorElement={anchorElement}
        groups={scopedGroups}
        validationStatus={validationStatus}
        disableAccordion={disableAccordion}
        readOnly={readOnly}
        renderNodeIcon={renderNodeIcon}
        renderValidationItem={renderValidationItem}
      />
    </>
  );
};
