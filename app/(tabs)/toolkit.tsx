import { ToolkitHome } from '@/features/toolkit/ToolkitHome';

// Same Toolkit as the SOS modal (PRODUCT_SPEC §5.3, CLAUDE.md offline-first
// requirement) — this tab just renders it without modal chrome.
export default function ToolkitScreen() {
  return <ToolkitHome />;
}
