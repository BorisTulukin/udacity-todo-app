import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from "../../businessLogic/todos";
import { apiResponseHelper } from "../../utils/apiResponseHelper"

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ', event)

    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const authorization = event.headers.Authorization
    const pieces = authorization.split(' ')
    const jwtToken = pieces[1]

    const newItem = await createTodo(newTodo, jwtToken)
    return apiResponseHelper(201, JSON.stringify({
        item: newItem
    }))
}
