import { FabricCircularProgress, FabricTabs } from "@fabric-kit/components";
import type {
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  GridValidRowModel,
} from "@fabric-kit/datagrid";
import { FabricDatagrid } from "@fabric-kit/datagrid";
import { FabricCenter, FabricStack, FabricText } from "@fabric-kit/primitives";
import type React from "react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import type {
  FabricSearchResultRow,
  FabricSearchTabModel,
  FabricViewAllSearchResultsProps,
} from "../types";
import { createInitialTabModels, isAbortError } from "../utils";

function getRowId(row: FabricSearchResultRow) {
  return row.id ?? `${row.type ?? "row"}-${row.name ?? row.description ?? ""}`;
}

function ViewAllSearchResultsImpl<Row extends GridValidRowModel & FabricSearchResultRow>({
  config,
  query,
  onFetchPage,
  counts,
  pageSize = 10,
  onError,
}: Readonly<FabricViewAllSearchResultsProps<Row>>) {
  // Compare by content so inline `config` / `counts` objects don't reset state on every render.
  const tabKeysId = Object.keys(config).join("|");
  const countsId = JSON.stringify(counts ?? {});
  const tabKeys = useMemo(() => tabKeysId.split("|").filter(Boolean), [tabKeysId]);
  const [activeTab, setActiveTab] = useState(tabKeys[0] ?? "");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabModels, setTabModels] = useState<Record<string, FabricSearchTabModel>>(() =>
    createInitialTabModels(config, pageSize, counts),
  );

  const latest = useRef({ onFetchPage, onError, config, counts });
  latest.current = { onFetchPage, onError, config, counts };

  // Reset when the query or tab setup changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the *Id keys stand in for config and counts.
  useEffect(() => {
    const { config, counts } = latest.current;
    setTabModels(createInitialTabModels(config, pageSize, counts));
    setActiveTab(Object.keys(config)[0] ?? "");
    setRows([]);
  }, [tabKeysId, countsId, pageSize, query]);

  const hasCustomComponent = Boolean(config[activeTab]?.component);

  const activeModel = tabModels[activeTab];
  const { paginationModel, sortModel, filterModel } = activeModel ?? {};

  useEffect(() => {
    if (!activeTab || !paginationModel || hasCustomComponent) return undefined;

    const controller = new AbortController();
    setLoading(true);
    latest.current
      .onFetchPage({
        query,
        type: activeTab,
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        sortModel,
        filterModel,
        signal: controller.signal,
      })
      .then((result) => {
        if (controller.signal.aborted) return;
        setRows(result.rows);
        setTabModels((previous) => ({
          ...previous,
          [activeTab]: { ...previous[activeTab], totalRecords: result.totalCount },
        }));
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        latest.current.onError?.(error);
        setRows([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [activeTab, filterModel, hasCustomComponent, paginationModel, query, sortModel]);

  const updateActiveTabModel = (update: Partial<FabricSearchTabModel>) => {
    setTabModels((previous) => ({
      ...previous,
      [activeTab]: {
        ...previous[activeTab],
        ...update,
      },
    }));
  };

  if (!tabKeys.length) {
    return (
      <FabricCenter sx={{ minHeight: 240 }}>
        <FabricText textVariant="bodyMd" color="text.secondary">
          No result types configured
        </FabricText>
      </FabricCenter>
    );
  }

  const ActiveComponent = config[activeTab]?.component;

  const resultGridSx = {
    minHeight: 410,
    p: 1,
    color: "text.primary",
    bgcolor: "transparent",
    borderColor: "divider",
    "& .MuiDataGrid-main, & .MuiDataGrid-virtualScroller, & .MuiDataGrid-overlayWrapper, & .MuiDataGrid-filler, & .MuiDataGrid-scrollbarFiller":
      {
        color: "text.primary",
        bgcolor: "transparent",
      },
    "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader": {
      color: "text.primary",
      bgcolor: "action.selected",
      borderColor: "divider",
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      color: "text.primary",
    },
    "& .MuiDataGrid-row, & .MuiDataGrid-cell": {
      color: "text.primary",
      bgcolor: "transparent",
      borderColor: "divider",
    },
    "& .MuiDataGrid-footerContainer": {
      color: "text.primary",
      bgcolor: "transparent",
      borderColor: "divider",
    },
    "& .MuiTablePagination-root, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
      {
        color: "text.primary",
      },
    "& .MuiIconButton-root, & .MuiSvgIcon-root": {
      color: "text.secondary",
    },
  };

  return (
    <FabricStack sx={{ width: "100%", bgcolor: "transparent", color: "text.primary" }}>
      <FabricTabs
        aria-label="Search result types"
        value={activeTab}
        onChange={(_, value) => {
          setActiveTab(value);
          setRows([]);
        }}
        variant="scrollable"
        scrollButtons="auto"
        tabs={tabKeys.map((key) => ({
          value: key,
          label: `${config[key].tabLabel} (${tabModels[key]?.totalRecords ?? 0})`,
        }))}
        sx={{
          px: 1,
          pt: 1,
          bgcolor: "transparent",
          "& .MuiTab-root": {
            color: "var(--mui-palette-text-primary)",
            opacity: 0.72,
          },
          "& .MuiTab-root.Mui-selected": {
            color: "var(--mui-palette-primary-main)",
            opacity: 1,
          },
          "& .MuiTabs-indicator": { bgcolor: "primary.main" },
        }}
      />

      {loading && !rows.length ? (
        <FabricCenter sx={{ minHeight: 410, p: 2 }}>
          <FabricCircularProgress size={40} />
        </FabricCenter>
      ) : ActiveComponent ? (
        <ActiveComponent query={query} type={activeTab} />
      ) : (
        <FabricDatagrid
          autoHeight
          columns={(config[activeTab]?.columns ?? []) as never[]}
          rows={rows}
          getRowId={getRowId}
          loading={loading}
          rowCount={activeModel?.totalRecords ?? 0}
          headerColor="var(--mui-palette-action-selected)"
          pagination
          hideFooter={false}
          paginationMode="server"
          paginationModel={activeModel?.paginationModel ?? { page: 0, pageSize }}
          onPaginationModelChange={(paginationModel: GridPaginationModel) => {
            updateActiveTabModel({ paginationModel });
          }}
          pageSizeOptions={[5, 10, 15, 20]}
          filterMode="server"
          filterModel={activeModel?.filterModel}
          onFilterModelChange={(filterModel: GridFilterModel) => {
            updateActiveTabModel({
              filterModel,
              paginationModel: {
                ...(activeModel?.paginationModel ?? { page: 0, pageSize }),
                page: 0,
              },
            });
          }}
          sortingMode="server"
          sortModel={activeModel?.sortModel}
          onSortModelChange={(sortModel: GridSortModel) => {
            updateActiveTabModel({
              sortModel,
              paginationModel: {
                ...(activeModel?.paginationModel ?? { page: 0, pageSize }),
                page: 0,
              },
            });
          }}
          sx={resultGridSx}
        />
      )}
    </FabricStack>
  );
}

ViewAllSearchResultsImpl.displayName = "FabricViewAllSearchResults";

export const FabricViewAllSearchResults = memo(ViewAllSearchResultsImpl) as <
  Row extends GridValidRowModel & FabricSearchResultRow,
>(
  props: Readonly<FabricViewAllSearchResultsProps<Row>>,
) => React.ReactElement | null;
