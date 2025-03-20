module.exports = function override(config) {
  config.resolve.fallback = {
    http: false,
    https: false,
    zlib: require.resolve("browserify-zlib"),
    url: require.resolve("url"),
    stream: require.resolve("crypto-browserify"),
    crypto: require.resolve("crypto-browserify"), // Fixes "crypto" fallback error,
    buffer: require.resolve("buffer"),

  };
  return config;
};
