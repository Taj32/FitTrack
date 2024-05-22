module.exports = {
    secret: "bezkoder-secret-key",
    jwtExpiration: 3600, // 1 hour expiration for access token
    jwtRefreshExpiration: 86400, //24 hour expiration for refresh

    /* testing purpose */
    // jwtExpiration: 60,          // 1 minute
    // jwtRefreshExpiration: 120,  // 2 minutes
  };