import { NextResponse } from "next/server";
import schema from "../../../../../data/contracts/crm-ticketing.schema.json";

export function GET() {
  return NextResponse.json(schema, {
    headers: {
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "content-disposition": "inline; filename=crm-ticketing.schema.json"
    }
  });
}
