const redirects = [
  { source: "/brief", destination: "/app/matches" },
  { source: "/opportunity", destination: "/app/matches" },
  { source: "/decision-room", destination: "/app/matches" },
  { source: "/impact", destination: "/app/matches" },
  { source: "/matches", destination: "/app/matches" },
  { source: "/matches/:fixtureId", destination: "/app/matches/:fixtureId" },
  { source: "/results", destination: "/app/learning" },
  { source: "/london-city", destination: "/live/london-city" }
];

const nextConfig = {
  typedRoutes: false,
  async redirects() {
    return redirects.map((item) => ({ ...item, permanent: true }));
  }
};

export default nextConfig;
