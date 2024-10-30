module.exports = ({ env }) => {
  return {
    upload: {
      config: {
        provider: "strapi-provider-firebase-storage",
        providerOptions: {
          serviceAccount: require("/etc/secrets/FirebaseServiceAccount.json"),
          // Custom bucket name
          bucket: env(
            "STORAGE_BUCKET_URL"
          ),
          sortInStorage: true, // true | false
          debug: false, // true | false
        },
      },
    },
  };
};