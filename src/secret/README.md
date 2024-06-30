# Secret Credentials
Place the following secret `.json` files here. The paths are accessed using the `.env` variables. The content of this folder will be ignored in source control except the `README.md` as mentioned in `.gitignore`

## Google Cloud Credentials

This application requires Google Cloud credentials for authentication and authorization if you want to access google drive and youtube.

**Important:** Do not commit your actual credential files to version control!

### Configuration Steps

1. **Obtain your Google Cloud credential files:**
- **`googleoauth2-client.json`:**  Obtain this file when you set up OAuth 2.0 for your web application in the Google Cloud Console ([https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)).

- **Crucial:** Ensure you've added "http://localhost:3000/api/google/auth/callback" to the *Authorized redirect URIs* section. Your `web.redirect_uris` field in the credential file should include "http://localhost:3000/api/google/auth/callback".

- **`googlecloud-service.json`:**  Obtain this file when you create a service account in the Google Cloud Console ([https://console.cloud.google.com/iam-admin/serviceaccounts](https://console.cloud.google.com/iam-admin/serviceaccounts)). 

2. **Place the credential files:**
- Save `googleoauth2-client.json` into the this folder.
- Save `googlecloud-service.json` into the this folder.

3. **Set up your `.env` file:**
- Create a `.env` file in the root directory if it doesn't exist.
- Add the following lines to your `.env` file, replacing the placeholders with the actual paths to your credential files:
    ```
    GOOGLE_OAUTH2_CLIENT_SECRET="./credentials/googleoauth2-client.json"
    GOOGLE_CLOUD_SERVICE_ACCOUNT="./credentials/googlecloud-service.json"
    ```