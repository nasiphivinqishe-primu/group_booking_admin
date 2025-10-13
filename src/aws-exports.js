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
        scopes: ["openid", "email", "profile"], // add "aws.cognito.signin.user.admin" if needed
        redirectSignIn: "http://localhost:3001/", // make sure the slash is here
        redirectSignOut: "http://localhost:3001/", // same here
        responseType: "code", // authorization code grant
      },
    },
  },
};

export default awsconfig;
