import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { createLogger } from '../utils/logger'
const logger = createLogger('dataLayer')

// originally copied from /c4-demos-master/10-udagram-app/src/businessLogic 
// replacing Group with TodoItem
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODO_TABLE,
    private readonly todoTableSecondaryIndexByUserId = process.env.TODO_TABLE_USER_ID_INDEX,
    private readonly todoS3Bucket = process.env.TODOS_S3_BUCKET,
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' })
    ) {
  }

  async createTodo(item: TodoItem): Promise<TodoItem>{
    logger.info('request to create todo item for the user: ', item )

    await this.docClient.put({
        TableName: this.todoTable,
        Item: item
    }).promise()

    return item
  }

  async deleteTodo(todoId: string){
    logger.info('request to delete update single todo : ', { todoId: todoId } )

    await this.docClient.delete({
        TableName: this.todoTable,
        Key: { "todoId": todoId } 
      }).promise()
  }  

  async getTodo(todoId: string): Promise<AWS.DynamoDB.QueryOutput> {
    logger.info('request to fetch a single todo : ', { todoId: todoId } )

    // passthrough to the Dynamo client
    return await this.docClient.query({
        TableName: this.todoTable,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: { ':todoId': todoId }
    }).promise()
  }

  async getTodos(userId: string): Promise<TodoItem[]> {

    logger.info('request to fetch todo items for the user: ', { userId: userId } )

    // as README.md requested - use index to fetch items efficiently
    const result = await this.docClient.query({
        TableName: this.todoTable,
        IndexName: this.todoTableSecondaryIndexByUserId,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues:{
            ':userId':userId
        }
    }).promise()

    const todos = result.Items as TodoItem[]

    logger.info('got items: ', { userId: userId, items: todos } )

    return todos
  }

  async updateTodo(todoId: string, todoUpdate: TodoUpdate){
    
    logger.info('request to update single todo : ', todoId )

    await this.docClient.update({
        TableName: this.todoTable,
        Key: { 'todoId': todoId },
        UpdateExpression: 'set #namefield = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: {
            ':name' : todoUpdate.name,
            ':dueDate' : todoUpdate.dueDate,
            ':done' : todoUpdate.done
        },
        ExpressionAttributeNames:{
            "#namefield": "name"
          }
    }).promise()
  }

  async generateUploadUrl(todoId: string): Promise<string> {
    const uploadUrl = `https://${this.todoS3Bucket}.s3.amazonaws.com/${todoId}`
  
    await this.docClient.update({
      TableName: this.todoTable,
        Key: {
          "todoId": todoId
        },
        UpdateExpression: "set attachmentUrl= :attachmentUrl",
        ExpressionAttributeValues:{
          ":attachmentUrl": uploadUrl
        }
    }).promise()
  
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.todoS3Bucket,
      Key: todoId,
      Expires: 300
    })
  }
}

// unchanged funtion from /c4-demos-master/10-udagram-app/src/businessLogic 
// might be used for running against locat DB
function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
