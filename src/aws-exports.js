const awsconfig = {
  Auth: {
    Cognito: {
      region: "eu-west-1",
      userPoolId: "eu-west-1_RNTBTtNvw",
      userPoolClientId: "42ubqja5f3mltt5f637hu6gqge",
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
