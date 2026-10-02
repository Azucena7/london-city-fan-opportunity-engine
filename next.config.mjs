const legacyClubRoutes = ["/brief", "/opportunity", "/decision-room", "/impact"];

const nextConfig = {
  typedRoutes: false,
  async redirects() {
    return legacyClubRoutes.map((source) => ({
      source,
      destination: "/matches",
      permanent: true
    }));
  }
};

export default nextConfig;
