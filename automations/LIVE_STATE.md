# Live Match State Contract

The frontend now uses one runtime state model: `LiveMatchState`.

Planning inputs come from the selected fixture. Weather is fetched live. Attendance momentum remains `null` until a verified source is connected.

A live score is calculated only when both weather and attendance momentum exist:
30% Territory + 20% Calendar + 15% Attention Availability + 10% Fixture Appeal + 10% Weather + 15% Attendance Momentum.

Until then the active decision remains the planning score. Unknown is never silently converted to zero.
