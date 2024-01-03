### Authentication module

#### /auth/signup

Signup with email, password, firstName and lastName.
What i do :

1. Validate request body
2. Check existed user
3. Hash password and save to database

![alt text](/docs/images/signup.png 'Title')

#### /auth/login

Login with email, password

1. Validate request body
2. Check if user is existed
3. Compare the received password with hashed password in database
4. Generate JWT access token and a refresh token
5. Response to client the access token information

![alt text](/docs/images/login.png 'Title')

Response body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhbmgyM0BnbWFpbC5jb20iLCJpYXQiOjE3MDQyNTIxMDAsImV4cCI6MTcwNDI1MzAwMH0.QQvl7gtl6jljZGYYYYq-9dJTRwYgFYrQRVaN3vM6qMs",
  "token_type": "Bearer",
  "expires_in": 1705152100727
}
```

#### /users/secret

For testing JWT auth guard

![alt text](/docs/images/secret.png)

#### /auth/logout

Log user out. Revoke refresh token, clear refresh-token store in cookie
![alt text](/docs/images/logout.png)

#### /auth/refresh

User must be logged in to use this api

1. Check if refresh token is valid (expiration, is used)
2. Create a new JWT access token and new refresh token
3. Response to client the access token information

![alt text](/docs/images/refresh.png)

#### Notes

For the refresh token flow, i follow the refresh token rotation
https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation
