'use strict'

import * as uuid from 'uuid'

import { DynamoDB } from 'aws-sdk'

let dynamoDb = new DynamoDB.DocumentClient();
if(process.env.LOCALSTACK_HOSTNAME && process.env.LOCALSTACK_HOSTNAME!==''){
  const options = {endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`}
  dynamoDb = new DynamoDB.DocumentClient(options);
}



module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime()
  const data = JSON.parse(event.body)
  if (typeof data.text !== 'string') {
    console.error('Validation Failed')
    callback(new Error('Couldn\'t create the todo item.'))
    return
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      text: data.text,
      checked: false,
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
      callback(new Error('Couldn\'t create the todo item.'))
      return
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item)
    }
    callback(null, response)
  })
}
