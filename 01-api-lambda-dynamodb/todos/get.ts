'use strict';

import { DynamoDB } from 'aws-sdk'

let dynamoDb = new DynamoDB.DocumentClient();
if(process.env.LOCALSTACK_HOSTNAME && process.env.LOCALSTACK_HOSTNAME!==''){
  const options = {endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`}
  dynamoDb = new DynamoDB.DocumentClient(options);
}

module.exports.get = (event, context, callback) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  };

  // fetch todo from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the todo item.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
    callback(null, response);
  });
};
