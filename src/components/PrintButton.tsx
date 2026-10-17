"use client";

/** Opens the browser's print dialog, where the page can also be saved as a PDF. */
export function PrintButton({ label = "Print or save as PDF", className }: { label?: string; className?: string }) {
  return <button type="button" className={className} onClick={() => window.print()}>{label}</button>;
}
