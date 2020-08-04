import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'

const todoAccess = new TodoAccess()
const logger = createLogger('todoBusinessLogic')

// originally copied from /c4-demos-master/10-udagram-app/src/businessLogic 
// replacing Group with TodoItem

export async function getTodos(jwtToken: string): Promise<TodoItem[]> {
  //same as groups except we need userId to get his/her todos
  const userId = parseUserId(jwtToken)
  return todoAccess.getTodos(userId)
}

export async function createTodo(
  request: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  //same as groups but different set of properties
  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    createdAt: new Date().toISOString(),
    name: request.name,
    dueDate: request.dueDate,
    done: false
    })
}

export async function deleteTodo(todoId: string): Promise<void> {
  await todoAccess.deleteTodo(todoId);
}

export async function updateTodo(todoId: string, request: UpdateTodoRequest): Promise<void> {
  logger.info('Updating the todo for the user', { todoId: todoId, request: request })

  // convert UpdateTodoRequest to TodoModel update
  await todoAccess.updateTodo(todoId, {
    name: request.name,
    dueDate: request.dueDate,
    done: request.done
  })
}


export async function generateUploadUrl(todoId: string): Promise<string> {
  logger.info('Generating upload url for a todo', { todoId: todoId })
  
  return await todoAccess.generateUploadUrl(todoId)
}