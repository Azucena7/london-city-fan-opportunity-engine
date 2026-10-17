import schoolHolidaysRaw from "../../data/seed/school-holidays.json";
import type { SchoolHolidayPeriod } from "@/lib/calendarMoments";

type Layer = {
  id: string;
  label: string;
  verification: string;
  periods: Array<{ id: string; label: string; start: string; end: string }>;
};

/** Every council school-holiday period, flagged verified only when its layer was checked against the council's page. */
export const schoolHolidayPeriods: SchoolHolidayPeriod[] = (schoolHolidaysRaw.layers as Layer[]).flatMap((layer) =>
  layer.periods.map((period) => ({
    layer: layer.id,
    layerLabel: layer.label.replace(/ \(.*\)$/, ""),
    label: period.label,
    start: period.start,
    end: period.end,
    verified: layer.verification === "verified"
  }))
);

export const schoolHolidays = schoolHolidaysRaw;
