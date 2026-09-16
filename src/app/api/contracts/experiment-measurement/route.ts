import { NextResponse } from "next/server";
import schema from "../../../../../data/contracts/experiment-measurement.schema.json";

export function GET() {
  return NextResponse.json(schema, {
    headers: {
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "content-disposition": "inline; filename=experiment-measurement.schema.json"
    }
  });
}
