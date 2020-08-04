import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getTodos } from "../../businessLogic/todos";
import { apiResponseHelper } from "../../utils/apiResponseHelper"

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const authorization = event.headers.Authorization
  const pieces = authorization.split(' ')
  const jwtToken = pieces[1]

  const todos = await getTodos(jwtToken)
  return apiResponseHelper(201, JSON.stringify({
    items: todos
  }))
}
