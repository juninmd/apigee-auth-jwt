```markdown
# Apigee-Auth-JWT

## Description

Generate the JWT token for your apps of Apigee.

## Installation

1.  **Dependencies:**
    *   `npm install axios`
    *   `npm install axios --save`
    *   `npm install cache`
    *   `npm install cache --save`
    *   `npm install jest`
    *   `npm install --save-dev @types/axios`
    *   `npm install --save-dev @types/axios/node`

2.  **Initialize:**
    ```bash
    npm init -y
    ```

3.  **Install dependencies:**
    ```bash
    npm install axios
    npm install axios --save
    npm install cache
    npm install cache --save
    npm install jest
    npm install --save-dev @types/axios
    npm install --save-dev @types/axios/node
    ```

4.  **Configure:**
    *   Set `APP_NAME` environment variable: `apigee-auth-jwt`
    *   Ensure your Apigee application is correctly configured to use JWT authentication.  Refer to the official Apigee documentation for detailed setup instructions.

## Usage

1.  **Generate Token:**
    ```bash
    npm run generate-jwt
    ```

2.  **Token Validation:**
    *   Use the `apigee-auth-jwt` library to verify the generated token against your Apigee application. The library provides a function to verify the token.  Consult the library documentation for the proper usage.

3.  **Use Token:**
    *   Your application can use the generated JWT token in subsequent API calls to authenticate.

4.  **Test Token:**
    *   Run the `token.test.js` unit test file to verify the token generation process and functionality.

```