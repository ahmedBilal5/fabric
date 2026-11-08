import { renderToString } from "react-dom/server";
import { App } from "./App";

/** Prerenders the page's text and chrome; live screens render in the browser. */
export function render(): string {
  return renderToString(<App />);
}
