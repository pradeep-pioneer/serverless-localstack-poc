import {SQSHandler, SQSMessageAttributes, SQSEvent, Context} from 'aws-lambda'
import {DynamoDB} from 'aws-sdk'

let dynamoDb = new DynamoDB.DocumentClient();
if(process.env.LOCALSTACK_HOSTNAME && process.env.LOCALSTACK_HOSTNAME!==''){
  const options = {endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`}
  dynamoDb = new DynamoDB.DocumentClient(options);
}
module.exports.execute = async (event: SQSEvent, context: Context) => {
  try {
    for (const record of event.Records) {
      const messageAttributes: SQSMessageAttributes = record.messageAttributes;
      console.log('\n****************************\n\n\nMessage Attributtes -->  ', JSON.stringify(messageAttributes));
      console.log('Message Body -->  ', record.body);

      // 
      // PROCESS HERE
      const msg = JSON.parse(record.body)
      msg['originalMessageId'] = record.messageId
      
      const processedBody = JSON.stringify(msg).toUpperCase()
      // PROCESS HERE
      // 

      console.log('sendMessage', processedBody)
      console.log('\n****************************\n\n\n');
    }
  } catch (error) {
    console.log(error);
  }
}
