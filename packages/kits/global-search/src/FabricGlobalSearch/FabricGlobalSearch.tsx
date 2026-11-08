import {
  FabricAutocomplete,
  FabricButton,
  FabricCircularProgress,
  FabricInputAdornment,
  FabricList,
  FabricTextField,
} from "@fabric-kit/components";
import SearchIcon from "@fabric-kit/icons/Search";
import {
  FabricCenter,
  FabricFlex,
  FabricInline,
  FabricStack,
  FabricSurface,
  FabricText,
} from "@fabric-kit/primitives";
import type { AutocompleteRenderGroupParams, PaperProps } from "@mui/material";
import type React from "react";
import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  FabricGlobalSearchProps,
  FabricSearchResponse,
  FabricSearchResultRow,
} from "../types";
import { escapeRegExp, flattenSearchResults, isAbortError } from "../utils";

const EMPTY_CONTEXT = { label: "", type: "" };

interface ViewAllState {
  totalCount: number;
  onViewAll?: () => void;
}

// The listbox slot lives at module level (so MUI doesn't remount it on each
// render) and reads the "View all" state from here instead of a closure.
const ViewAllContext = createContext<ViewAllState>({ totalCount: 0 });

const ListboxSlot = forwardRef<HTMLUListElement, HTMLAttributes<HTMLElement>>(
  function GlobalSearchListboxSlot({ children, ...rest }, ref) {
    const { totalCount, onViewAll } = useContext(ViewAllContext);
    return (
      <FabricStack sx={{ width: "100%" }}>
        <FabricList ref={ref} component="ul" {...rest} sx={{ minHeight: 300, width: "100%", p: 0 }}>
          {children}
        </FabricList>
        {onViewAll && (
          <FabricCenter sx={{ mt: 2 }}>
            <FabricButton
              variant="text"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onViewAll}
            >
              View all results ({totalCount})
            </FabricButton>
          </FabricCenter>
        )}
      </FabricStack>
    );
  },
);

const PaperSlot = forwardRef<HTMLDivElement, PaperProps>(function GlobalSearchPaperSlot(
  { variant: _variant, ...surfaceProps },
  ref,
) {
  return (
    <FabricSurface
      ref={ref}
      elevation={1}
      sx={{ width: "100%", p: 3, borderRadius: 2 }}
      {...surfaceProps}
    />
  );
});

function getOptionLabel(option: FabricSearchResultRow | string) {
  if (typeof option === "string") return option;
  return option.name ?? "";
}

function renderHighlightedText(text: unknown, search: string) {
  const value = text == null ? "" : String(text);
  if (!search || !value) return value;

  const parts = value.split(new RegExp(`(${escapeRegExp(search)})`, "gi"));
  let matchCount = 0;
  return (
    <>
      {parts.map((part) => {
        if (part.toLowerCase() !== search.toLowerCase()) return part;

        const key = `${part}-${matchCount}`;
        matchCount += 1;
        return (
          <FabricText key={key} component="span" textVariant="bodyMd" sx={{ fontWeight: 600 }}>
            {part}
          </FabricText>
        );
      })}
    </>
  );
}

function GlobalSearchImpl<Row extends FabricSearchResultRow>({
  disabled = false,
  config,
  onSearch,
  onClickViewAll,
  context = EMPTY_CONTEXT,
  placeholder = "Search",
  debounceMs = 300,
  onError,
}: Readonly<FabricGlobalSearchProps<Row>>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<FabricSearchResponse<Row>>();

  // Read the latest callbacks without re-running the search when a parent
  // passes new inline functions or objects on each render.
  const latest = useRef({ onSearch, onError, config, context });
  latest.current = { onSearch, onError, config, context };

  useEffect(() => {
    if (!search) {
      setOpen(false);
      setRows([]);
      setResponseData(undefined);
      setLoading(false);
      return undefined;
    }

    setOpen(true);
    setRows([]);
    setLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      const { onSearch, config, context } = latest.current;
      onSearch(search, { signal: controller.signal })
        .then((data) => {
          if (controller.signal.aborted) return;
          setResponseData(data);
          setRows(flattenSearchResults(data, config, context));
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted || isAbortError(error)) return;
          latest.current.onError?.(error);
          setRows([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, debounceMs);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [debounceMs, search]);

  const totalCount =
    responseData?.totalCount ??
    responseData?.groups.reduce((sum, group) => sum + (group.totalCount ?? 0), 0) ??
    0;

  const countsByType = useMemo(() => {
    const counts = new Map<string, number>();
    responseData?.groups.forEach((group) => {
      counts.set(group.type, group.totalCount ?? group.results.length);
    });
    return counts;
  }, [responseData]);

  const resetSearch = useCallback(() => {
    setOpen(false);
    setRows([]);
    setResponseData(undefined);
    setSearch("");
  }, []);

  const viewAll = useMemo<ViewAllState>(
    () => ({
      totalCount,
      onViewAll: onClickViewAll
        ? () => {
            onClickViewAll(search);
            resetSearch();
          }
        : undefined,
    }),
    [onClickViewAll, resetSearch, search, totalCount],
  );

  return (
    <ViewAllContext.Provider value={viewAll}>
      <FabricAutocomplete<Row, false, false, true>
        id="global-search-autocomplete"
        disabled={disabled}
        disablePortal
        clearOnBlur
        fullWidth
        freeSolo
        value={null}
        inputValue={search}
        options={rows}
        getOptionLabel={getOptionLabel}
        groupBy={(option) => option.type ?? ""}
        filterOptions={(options) => options}
        open={open}
        onClose={() => setOpen(false)}
        onInputChange={(_, value, reason) => {
          if (reason === "reset") return;
          setSearch(value);
        }}
        loading={loading}
        loadingText={
          <FabricCenter sx={{ minHeight: 220 }}>
            <FabricCircularProgress size={40} />
          </FabricCenter>
        }
        noOptionsText={
          search ? (
            <FabricCenter sx={{ minHeight: 160 }}>
              <FabricText textVariant="bodyMd" color="text.secondary">
                No results
              </FabricText>
            </FabricCenter>
          ) : null
        }
        slots={{ paper: PaperSlot, listbox: ListboxSlot }}
        renderInput={(params) => (
          <FabricTextField
            {...params}
            id="global-search-input"
            placeholder={placeholder}
            variant="standard"
            height="40px"
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                startAdornment: (
                  <FabricInputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </FabricInputAdornment>
                ),
                endAdornment: null,
                disableUnderline: true,
              },
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") resetSearch();
            }}
            onBlur={resetSearch}
            sx={{ px: 1, fontWeight: 400, color: "text.primary" }}
          />
        )}
        renderGroup={(params: AutocompleteRenderGroupParams) => {
          const entryConfig = config[params.group];
          return (
            <li key={params.key}>
              <FabricStack sx={{ pb: 1.5, mb: 1.5, borderBottom: 1, borderColor: "divider" }}>
                <FabricFlex justify="space-between" sx={{ px: 1, pb: 1 }}>
                  <FabricText textVariant="uiMd" color="text.secondary">
                    {entryConfig?.displayLabel ?? params.group}
                  </FabricText>
                  <FabricText textVariant="uiMd">
                    {countsByType.get(params.group) ?? 0} results
                  </FabricText>
                </FabricFlex>
                {params.children}
              </FabricStack>
            </li>
          );
        }}
        renderOption={(props, option) => {
          const entryConfig = option.type ? config[option.type] : undefined;

          if (!option.name) {
            return (
              <li {...props} key={`${option.type}-empty`}>
                <FabricCenter sx={{ width: "100%", py: 1 }}>
                  <FabricText textVariant="uiMd" color="text.secondary">
                    No results
                  </FabricText>
                </FabricCenter>
              </li>
            );
          }

          return (
            <li {...props} key={option.id ?? `${option.type}-${option.name}`}>
              <FabricFlex
                justify="space-between"
                align="center"
                sx={{ width: "100%", px: 1, py: 1, cursor: "pointer" }}
                onClick={() => {
                  entryConfig?.onClickResult(option as Row);
                  resetSearch();
                }}
              >
                <FabricInline align="center" gap="md" sx={{ minWidth: 0 }}>
                  {option.image ? (
                    <FabricCenter
                      component="span"
                      sx={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden" }}
                    >
                      <img src={option.image} alt="" width={32} height={32} />
                    </FabricCenter>
                  ) : (
                    entryConfig?.icon
                  )}
                  <FabricText textVariant="bodyMd" truncate sx={{ maxWidth: 200 }}>
                    {renderHighlightedText(option.name, search)}
                  </FabricText>
                </FabricInline>
                <FabricText
                  textVariant="uiMd"
                  color="text.secondary"
                  truncate
                  sx={{ maxWidth: 200 }}
                >
                  {renderHighlightedText(option.description, search)}
                </FabricText>
              </FabricFlex>
            </li>
          );
        }}
      />
    </ViewAllContext.Provider>
  );
}

GlobalSearchImpl.displayName = "FabricGlobalSearch";

export const FabricGlobalSearch = memo(GlobalSearchImpl) as <Row extends FabricSearchResultRow>(
  props: Readonly<FabricGlobalSearchProps<Row>>,
) => React.ReactElement | null;
