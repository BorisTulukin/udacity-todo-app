import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodo } from "../../businessLogic/todos";
import { apiResponseHelper } from "../../utils/apiResponseHelper"

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  console.log("Delete todoId: " + todoId)
  await deleteTodo(todoId)
  return apiResponseHelper(200, "")
}

