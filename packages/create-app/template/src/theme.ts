import { createFabricTheme } from "@fabric-kit/theme";

/**
 * Your app's theme. With no options it's Fabric's look. To use your brand's colors,
 * set them for both modes; every Fabric component follows:
 *
 *   createFabricTheme({
 *     colorSchemes: {
 *       light: { palette: { primary: { main: "#2563EB" } } },
 *       dark: { palette: { primary: { main: "#60A5FA" } } },
 *     },
 *   })
 *
 * See https://ahmedbilal5.github.io/fabric/docs/?path=/docs/foundations-theming--docs
 */
export const theme = createFabricTheme();
