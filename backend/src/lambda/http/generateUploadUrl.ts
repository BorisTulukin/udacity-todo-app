import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { generateUploadUrl } from "../../businessLogic/todos";
import { apiResponseHelper } from "../../utils/apiResponseHelper"


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  const uploadUrl = await generateUploadUrl(todoId)
  return apiResponseHelper(201, JSON.stringify({
     uploadUrl: uploadUrl
  }))
}

