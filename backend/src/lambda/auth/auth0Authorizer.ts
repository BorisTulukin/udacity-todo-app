import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('authLambda')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-eq5o9nlh.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized, payload', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  logger.info('AUG03 decoded jwt (resutl ', jwt );

  if(!jwt){
    throw new Error('invalid JWT token')
  }

  try {
    const response = await Axios.get(jwksUrl);
    logger.info('AUG03 response from Auth0', response);

    const pem = certToPEM( response.data.keys[0].x5c[0] )
    const verifedToken = verify(token, pem, { algorithms:['RS256'] } )

    return  verifedToken as JwtPayload
  } catch (error) {
    logger.error(error);
    return undefined
  }
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('AUG03 No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('AUG03 Invalid authentication header')

  const pieces = authHeader.split(' ')

  return pieces[1]
}


// from here: https://github.com/sgmeyer/auth0-node-jwks-rs256/blob/master/src/lib/utils.js
function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}