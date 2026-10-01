// A reviewed match-specific official time takes precedence over the generic feed.
// If the fixture date changes, the old review must not be carried forward.
export function reviewedKickoff(previous, date, fetchedKickoff) {
  const review = previous.kickoffVerification;
  if (previous.date === date && review?.value && review.sourceUrls?.length >= 2) {
    return review.value;
  }
  const unresolved = previous.sourceDiscrepancies?.find(
    (item) => item.field === "kickoff" && item.state === "unresolved"
  );
  return unresolved?.values?.some((item) => item.value === previous.kickoff)
    ? previous.kickoff : fetchedKickoff;
}
