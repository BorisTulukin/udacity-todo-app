import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from "../../businessLogic/todos";
import { apiResponseHelper } from "../../utils/apiResponseHelper"

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodoRequest: UpdateTodoRequest = JSON.parse(event.body)

  await updateTodo(todoId, updatedTodoRequest )
  return apiResponseHelper(200, "")
}
