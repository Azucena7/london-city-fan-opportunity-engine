const redirects = [
  { source: "/brief", destination: "/app/matches" },
  { source: "/opportunity", destination: "/app/matches" },
  { source: "/decision-room", destination: "/app/matches" },
  { source: "/impact", destination: "/app/matches" },
  { source: "/matches", destination: "/app/matches" },
  { source: "/matches/:fixtureId", destination: "/app/matches/:fixtureId" },
  { source: "/results", destination: "/app/learning" },
  { source: "/today", destination: "/app" },
  { source: "/this-week", destination: "/app" },
  { source: "/calendar", destination: "/app/matches" },
  { source: "/fixtures", destination: "/app/matches" },
  { source: "/opportunities", destination: "/app/matches" },
  { source: "/signals", destination: "/app/matches" },
  { source: "/measurement", destination: "/app/learning" },
  { source: "/sources", destination: "/app/sources" },
  { source: "/access", destination: "/app/access" },
  { source: "/demo", destination: "/app/demo" },
  { source: "/club", destination: "/app" },
  { source: "/club/sign-in", destination: "/app/access" },
  { source: "/club-demo", destination: "/app/demo" },
  { source: "/club-demo/:path*", destination: "/app/demo" },
  { source: "/experience", destination: "/app" },
  { source: "/mobility", destination: "/app" },
  { source: "/territories", destination: "/app" },
  { source: "/territory-travel", destination: "/app" },
  { source: "/travel", destination: "/app" },
  { source: "/partners", destination: "/app" },
  { source: "/story", destination: "/case-study" },
  { source: "/method", destination: "/case-study" },
  { source: "/london-city", destination: "/live/london-city" },
  { source: "/london-city/:case", destination: "/live/london-city/:case" }
];

const nextConfig = {
  typedRoutes: false,
  async redirects() {
    return redirects.map((item) => ({ ...item, permanent: true }));
  }
};

export default nextConfig;
