import { expect, test } from "@playwright/test";

// Synthetic ticket rows generated in the test; nothing here is club data.
function exportRows(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    schema_version: "1.0",
    fixture_id: "2026-09-26-bha-h",
    channel: "owned",
    supporter_id_hash: `supporter${String(i).padStart(4, "0")}`,
    order_id_hash: `order${String(i).padStart(5, "0")}`,
    ticket_id_hash: `ticket${String(i).padStart(5, "0")}`,
    order_timestamp: "2026-09-20T10:00:00Z",
    ticket_product: "Adult",
    ticket_type: i % 2 ? "season" : "single",
    quantity: 1,
    realised_unit_price: 12,
    currency: "GBP",
    scan_status: "scanned",
    scan_timestamp: "2026-09-26T12:30:00Z",
    postcode_sector: "BR1 3",
    consent_status: "consented",
    source_system: "synthetic-test",
    extracted_at: "2026-09-27T09:00:00Z"
  }));
}

test("signed out, Sources explains the aggregate upload without offering it", async ({ page }) => {
  await page.goto("/app/sources");
  const card = page.getByRole("region", { name: "Ticketing and access aggregate" });
  await expect(card).toContainText("supporter, order and ticket keys never leave this device");
  await expect(card).toContainText("Sign in as a club administrator");
  await expect(card.locator('input[type="file"]')).toHaveCount(0);
  await expect(card.getByRole("link", { name: /Export contract/ })).toHaveAttribute("href", "/api/contracts/crm-ticketing");
});

test("a club administrator uploads only the aggregate of an authorised export", async ({ page }) => {
  const posted: Array<Record<string, unknown>> = [];
  await page.route("**/api/auth/session", (route) => route.fulfill({
    json: { configured: true, authenticated: true, clubs: [{ id: "club-1", name: "Demo club", role: "admin" }] }
  }));
  await page.route("**/api/journey-aggregate**", async (route) => {
    if (route.request().method() === "POST") {
      posted.push(route.request().postDataJSON() as Record<string, unknown>);
      return route.fulfill({ json: { persistence: "club", stored: { id: "1", uploaded_at: "2026-10-14T10:00:00Z" } } });
    }
    return route.fulfill({ json: { persistence: "club", aggregate: null } });
  });

  await page.goto("/app/sources");
  const card = page.getByRole("region", { name: "Ticketing and access aggregate" });
  await expect(card).toContainText("No aggregate uploaded for this club yet.");
  await card.locator('input[type="file"]').setInputFiles({ name: "export.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(exportRows(24))) });
  await expect(card).toContainText("24 ticket rows read in this browser. Nothing has been uploaded yet.");
  expect(posted).toHaveLength(0);

  await card.getByRole("button", { name: "Upload aggregate" }).click();
  await expect(card).toContainText("Aggregate stored for the club.");
  expect(posted).toHaveLength(1);
  expect(posted[0].clubId).toBe("club-1");
  const dataset = posted[0].dataset as { datasetState: string; fixtureSummaries: Array<{ tickets: number; seasonTicketScanRate: number }> };
  expect(dataset.datasetState).toBe("club-aggregate");
  expect(dataset.fixtureSummaries[0].tickets).toBe(24);
  expect(dataset.fixtureSummaries[0].seasonTicketScanRate).toBe(1);
  expect(JSON.stringify(posted[0])).not.toMatch(/supporter0|order0|ticket0|BR1 3/);
});

test("an export with direct identifiers is refused in the browser", async ({ page }) => {
  await page.route("**/api/auth/session", (route) => route.fulfill({
    json: { configured: true, authenticated: true, clubs: [{ id: "club-1", name: "Demo club", role: "admin" }] }
  }));
  await page.route("**/api/journey-aggregate**", (route) => route.fulfill({ json: { persistence: "club", aggregate: null } }));
  await page.goto("/app/sources");
  const card = page.getByRole("region", { name: "Ticketing and access aggregate" });
  const rows = exportRows(12).map((row) => ({ ...row, email: "someone@example.com" }));
  await card.locator('input[type="file"]').setInputFiles({ name: "export.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(rows)) });
  await expect(card.getByRole("list", { name: "Export problems" })).toContainText("forbidden direct-identifier field email");
  await expect(card.getByRole("button", { name: "Upload aggregate" })).toHaveCount(0);
});
