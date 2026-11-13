/**
 * An in-memory "backend" for the example app. The functions are async and wait a
 * moment, like network calls, so the pages show their real loading and saving states.
 * Swap this file for your API client; the pages only use the hook's functions.
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { applyFormValues, type CustomerFormValues } from "./customerForm";
import { type Customer, generateCustomers, PLANS, STATUSES, toDay } from "./customers";

/** Something that happened to a customer, for the activity feed. */
export interface CustomerEvent {
  id: string;
  customerId: string;
  actor: string;
  action: string;
  target?: string;
  date: number;
}

export interface DataValue {
  /** False until the first load finishes. */
  ready: boolean;
  /** "Today" for the data and the date filters. */
  today: Date;
  customers: Customer[];
  /** Events newest first: edits made in this session, then the account's creation. */
  eventsFor: (id: string) => CustomerEvent[];
  createCustomer: (values: CustomerFormValues) => Promise<Customer>;
  updateCustomer: (id: string, values: CustomerFormValues) => Promise<Customer>;
  deleteCustomers: (ids: readonly string[]) => Promise<void>;
  /** Puts the sample data back, as on first load. */
  reset: () => void;
}

const DataContext = createContext<DataValue | null>(null);

export interface DataProviderProps {
  /** Pretend network delay in ms. @default 450 */
  latency?: number;
  /** "Today" for the generated data. Set it for stable screenshots and tests. Defaults to now. */
  today?: Date;
  /** The signed-in user, named in activity. @default "Jane Doe" */
  user?: string;
  children: ReactNode;
}

export function DataProvider({
  latency = 450,
  today: todayProp,
  user = "Jane Doe",
  children,
}: DataProviderProps) {
  const [today] = useState(() => todayProp ?? new Date());
  const seed = useCallback(() => generateCustomers(today), [today]);
  const [customers, setCustomers] = useState<Customer[]>(seed);
  const [events, setEvents] = useState<CustomerEvent[]>([]);
  const [ready, setReady] = useState(latency === 0);

  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => setReady(true), latency);
    return () => clearTimeout(t);
  }, [ready, latency]);

  const wait = useCallback(() => new Promise((r) => setTimeout(r, latency)), [latency]);

  const log = useCallback(
    (customerId: string, action: string, target?: string) =>
      setEvents((list) => [
        { id: `e-${list.length + 1}`, customerId, actor: user, action, target, date: Date.now() },
        ...list,
      ]),
    [user],
  );

  // Kept in a ref so the async functions always see the latest list.
  const latest = useRef(customers);
  latest.current = customers;

  const value = useMemo<DataValue>(
    () => ({
      ready,
      today,
      customers,
      eventsFor: (id) => {
        const c = latest.current.find((x) => x.id === id);
        const created: CustomerEvent[] = c
          ? [
              {
                id: `${id}-created`,
                customerId: id,
                actor: c.owner,
                action: "created the account",
                // Mid-morning on the day, but never in the future for accounts made today.
                date: Math.min(new Date(`${c.createdAt}T10:00:00`).getTime(), Date.now()),
              },
            ]
          : [];
        return [...events.filter((e) => e.customerId === id), ...created];
      },
      createCustomer: async (values) => {
        await wait();
        const max = Math.max(1000, ...latest.current.map((c) => Number(c.id.slice(2)) || 0));
        const blank: Customer = {
          ...values,
          id: `c-${max + 1}`,
          createdAt: toDay(today),
          contact: { ...values.contact },
        };
        const created = applyFormValues(blank, values, toDay(today));
        // `eventsFor` adds the creation event from `createdAt`.
        setCustomers((list) => [created, ...list]);
        return created;
      },
      updateCustomer: async (id, values) => {
        await wait();
        const current = latest.current.find((c) => c.id === id);
        if (!current)
          throw new Error("This customer was deleted. Go back to the list to see the others.");
        const updated = applyFormValues(current, values, toDay(today));
        setCustomers((list) => list.map((c) => (c.id === id ? updated : c)));
        const changes: [string, string][] = [];
        if (current.plan !== updated.plan || current.seats !== updated.seats)
          changes.push([
            "changed the plan to",
            `${PLANS[updated.plan].label}, ${updated.seats} seats`,
          ]);
        if (current.status !== updated.status)
          changes.push(["changed the status to", STATUSES[updated.status].label]);
        if (current.owner !== updated.owner)
          changes.push(["assigned the account to", updated.owner]);
        if (changes.length === 0) log(id, "edited the details");
        for (const [action, target] of changes) log(id, action, target);
        return updated;
      },
      deleteCustomers: async (ids) => {
        await wait();
        const gone = new Set(ids);
        setCustomers((list) => list.filter((c) => !gone.has(c.id)));
      },
      reset: () => {
        setCustomers(seed());
        setEvents([]);
      },
    }),
    [ready, today, customers, events, wait, log, seed],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

/** The app's data and the functions that change it. */
export function useData(): DataValue {
  const value = useContext(DataContext);
  if (!value) throw new Error("useData must be used inside <DataProvider>");
  return value;
}
