## Installation Steps

### Preparation
1. Install latest NodeJS version in your machine and ensure npm syntax is working. You can execute this code in console "npm --version". If it return the version, that means you have successfully installed NodeJS
2. Install MongoDB in your local or get a cloud of MongoDB account

### Installation for Production
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
5. PORT: for development environment, the value is usually defined as 3000, production is 80
6. MONGODB_URL: this is the value of connection string to MongoDB. For local, the value is usually mongodb://127.0.0.1:27017/ijooz
7. JWT_SECRET: this is a value that is used for password seed. It is recommended to define the value as minimum 10 chars, at least 1 number, 1 symbol, 1 upper case and 1 lower case. E.g. W0rld_Peac3
8. SMTP_SENDER_EMAIL: this is used as sender's email address
9. SMTP_API_KEY: this is the API key generated from sendgrid.com. To get a new one, you can visit https://sendgrid.com/
10. BRAND_SHORT: this is your brand name in short. If no value defined, then it will use default value
11. BRAND_LONG: this is your complete brand name. If no value defined, then it will use default value