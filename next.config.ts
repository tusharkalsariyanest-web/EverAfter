/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io", // Allows UploadThing images (Your Gowns)
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Allows Google Profile pictures
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
