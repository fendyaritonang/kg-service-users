require('log-timestamp');

// Anonymize value of object with name "password" or "passwd"
const objPasswordAnonymization = (obj) => {
  Object.keys(obj).forEach((p) => {
    if (
      typeof obj[p] !== 'object' &&
      (p.indexOf('password') !== -1 || p.indexOf('passwd') !== -1)
    ) {
      obj[p] = 'xxxx';
    } else if (typeof obj[p] == 'object') {
      if (!Array.isArray(obj[p])) {
        objPasswordAnonymization(obj[p]);
      } else {
        obj[p].forEach((q) => {
          objPasswordAnonymization(q);
        });
      }
    }
  });
};

const logging = {
  log: (message) => {
    console.log(message);
  },
  routerErrorLog: (routerRequest, message, data) => {
    const routerURL =
      routerRequest.protocol +
      '://' +
      routerRequest.get('host') +
      routerRequest.originalUrl;

    let requestUser = { ...routerRequest.user };
    let requestParams = { ...routerRequest.params };
    let requestBody = { ...routerRequest.body };
    let logData = { ...data };

    objPasswordAnonymization(requestUser);
    objPasswordAnonymization(requestParams);
    objPasswordAnonymization(requestBody);
    objPasswordAnonymization(logData);

    console.log(
      `RouterInfo=>(${
        routerRequest.method
      }) ${routerURL}. ReqUsers=>${JSON.stringify(
        requestUser
      )}. ReqParams=>${JSON.stringify(
        requestParams
      )}. ReqBody=>${JSON.stringify(requestBody)}. Message=>${message}. ${
        data ? `Data=>${JSON.stringify(logData)}` : ''
      }}`
    );
  },
};

module.exports = logging;
