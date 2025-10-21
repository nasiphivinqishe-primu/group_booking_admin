const awsconfig = {
  Auth: {
    Cognito: {
      region: "eu-west-1",
      userPoolId: "eu-west-1_OGI8d9egu",
      userPoolClientId: "5rbmt1n62lm4n5s5uhr0diu53a",
      loginWith: {
        email: true,
        username: false,
        phone: false,
      },
      oauth: {
        domain: "https://prim-u.auth.eu-west-1.amazoncognito.com",
        scopes: ["openid", "email", "profile"], 
        redirectSignIn: "http://localhost:3001/", 
        redirectSignOut: "http://localhost:3001/", 
        responseType: "code", 
      },
    },
  },
};

export default awsconfig;
