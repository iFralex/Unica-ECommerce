module.exports = ({ env }) => ({
    //...
    'import-export-entries': {
        enabled: true,
        config: {
            // See `Config` section.
        },
    },
    upload: {
        config: {
            provider: "strapi-provider-firebase-storage",
            providerOptions: {
                serviceAccount: require("../../FirebaseServiceAccount.json"),
                // Custom bucket name
                bucket: env(
                    "STORAGE_BUCKET_URL"
                ),
                sortInStorage: true, // true | false
                debug: false, // true | false
            },
        },
    },
});