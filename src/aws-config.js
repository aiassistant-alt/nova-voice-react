/**
 * AWS Amplify Configuration
 * Configuración de AWS Cognito para autenticación
 */

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_4jx4yzrZ8',
      userPoolClientId: '1juckgedu0gf5qv8fommh486bh',
      region: 'us-east-1',
      loginWith: {
        email: true,
        username: false,
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false,
      },
    }
  }
};

export default awsConfig;