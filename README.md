## Installation Steps

### Preparation
1. Install latest NodeJS version in your machine and ensure npm syntax is working. You can execute this code in console "npm --version". If it return the version, that means you have successfully installed NodeJS
2. Install MongoDB in your local or get a cloud of MongoDB account

### Installation
1. Copy file source into a folder
2. Open a console and navigate to the folder
3. Execute "npm install" to install all npm packages of this service
4. Create the following Operating System (OS) environment variables:
   - PORT
   - MONGODB_URL
   - JWT_SECRET
   - SMTP_SENDER_EMAIL
   - SMTP_API_KEY
   - BRAND_SHORT
   - BRAND_LONG
5. PORT: for development environment, the value is usually defined as 3000, production is 80. If the value is not defined, then default is 3000
6. MONGODB_URL: this is the value of connection string to MongoDB. For local, the value is usually mongodb://127.0.0.1:27017/ijooz
7. JWT_SECRET: this is a value for signing JWT authentication token. It is recommended to define the value as minimum 10 chars, at least 1 number, 1 symbol, 1 upper case and 1 lower case. E.g. W0rld_Peac3. Please keep this confidential and ensure you never share this value.
8. SMTP_SENDER_EMAIL: this is used as sender's email address
9. SMTP_API_KEY: this is the API key generated from sendgrid.com. To get a new one, you can visit https://sendgrid.com/
10. BRAND_SHORT: this is your brand name in short. If no value defined, then it will use default value
11. BRAND_LONG: this is your complete brand name. If no value defined, then it will use default value

### Swagger API Documentation 
Once the application is running, API documentation can be viewed through swagger at
```sh
http://<your_environment>:<designated_port_no>/users-api-docs
```
For example if your environment is localhost and designated port number is 3000, then swagger can be viewed at
```sh
http://localhost:3000/users-api-docs
```
