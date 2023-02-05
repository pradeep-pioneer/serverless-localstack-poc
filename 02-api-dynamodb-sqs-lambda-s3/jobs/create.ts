'use strict'

import * as uuid from 'uuid'

import { DynamoDB, SQS  } from 'aws-sdk'

const queueName: string = process.env.SQS_NAME;

let dynamoDb = new DynamoDB.DocumentClient();
let sqs = new SQS();
if(process.env.LOCALSTACK_HOSTNAME && process.env.LOCALSTACK_HOSTNAME!==''){
  const options = {endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`}
  dynamoDb = new DynamoDB.DocumentClient(options);
  sqs = new SQS({endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`})
}



module.exports.create = (event, context, callback) => {
  const region = context.invokedFunctionArn.split(':')[3];
  const accountId = context.invokedFunctionArn.split(':')[4];
  let queueUrl = `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`

  if(process.env.LOCALSTACK_HOSTNAME && process.env.LOCALSTACK_HOSTNAME!==''){
    queueUrl = `http://${process.env.LOCALSTACK_HOSTNAME}:4566/000000000000/${queueName}`
  }
  
  const timestamp = new Date().getTime()
  const data = JSON.parse(event.body)
  if (typeof data.searchTerm !== 'string') {
    console.error('\n\nValidation Failed\n\n')
    callback(new Error('Validation Failed: Invalid Data Received'))
    return
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      searchTerm: data.searchTerm,
      finished: false,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  }
  
  console.log('\n\n\n\n');
  console.log(`Host: http://${process.env.LOCALSTACK_HOSTNAME}:4566`);
  console.log(`Table: ${process.env.DYNAMODB_TABLE}`);
  console.log('\n\n\n\n');
  // write the todo to the database
  dynamoDb.put(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error)
      callback(new Error('Couldn\'t create the job item.'))
      return
    }

    let msgParams = {
      QueueUrl:
        queueUrl, // queueName will never be empty
      MessageBody: JSON.stringify(params.Item)
    };
    sqs.sendMessage(msgParams, (err, data) => {
      if(err) {
        console.error(error)
        callback(new Error('Couldn\'t send the job item message - try again.'))
        return
      }
    });
    // create a response
    const response = {
      statusCode: 202,
      body: JSON.stringify(params.Item)
    }
    callback(null, response)
  })
}
