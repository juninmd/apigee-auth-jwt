# Apigee Auth JWT

## Description

The apigee-auth-jwt library provides a simple and efficient way to generate authentication tokens and add authorization headers for requests to Apigee.
It also includes a cache system to improve performance by reducing the number of token requests made to the server.

## Installation

You can install the library via npm:

```sh
npm i apigee-auth-jwt
```

## Usage

## Generate token

To generate a token, use the getToken function:

```js
const { getToken }  = require('apigee-auth-jwt');
const token = await getToken('apigee.com','client_key','client_secret');
```

## Generate Axios Client with Authorization Header

To generate an Axios client with the authorization header, use the axiosAuth function:

```js
const { axiosAuth }  = require('apigee-auth-jwt');
const axios = await axiosAuth('apigee.com','client_key','client_secret');

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});
```

## Contributing

Contributions are always welcome! Please feel free to submit a pull request or open an issue if you encounter any problems or have suggestions for improvement.
