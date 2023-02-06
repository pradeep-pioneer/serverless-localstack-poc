import {SQSHandler, SQSMessageAttributes, SQSEvent, Context} from 'aws-lambda'
import {DynamoDB, S3} from 'aws-sdk'

let dynamoDb = new DynamoDB.DocumentClient();
let s3 = new S3();
if(process.env.LOCALSTACK_HOSTNAME && process.env.LOCALSTACK_HOSTNAME!==''){
  const options = {endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`}
  dynamoDb = new DynamoDB.DocumentClient(options);
  s3 = new S3({...options, s3ForcePathStyle: true});
}
module.exports.execute = async (event: SQSEvent, context: Context) => {
  const updateDatabase = async(id: string, searchTerm: string, result: boolean) =>{
    const timestamp = new Date().getTime();
    //database update
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        id: id,
      },
      ExpressionAttributeNames: {
        '#jobs_searchTerm': 'text',
      },
      ExpressionAttributeValues: {
        ':searchTerm': searchTerm,
        ':finished': result,
        ':updatedAt': timestamp,
      },
      UpdateExpression: 'SET #jobs_searchTerm = :searchTerm, finished = :finished, updatedAt = :updatedAt',
      ReturnValues: 'ALL_NEW',
    };

    dynamoDb.update(params, (error, result) => {
      // handle potential errors
      if (error) {
        console.error(error);
        return;
      }
      
      console.log(`Updated record [${id}] with result [${result}]`)
      console.log('\n****************************\n\n\n')
    });
  };
  
  try {
    for (const record of event.Records) {
      const messageAttributes: SQSMessageAttributes = record.messageAttributes;
      console.log('\nReceived Message Attributtes -->  ', JSON.stringify(messageAttributes));
      console.log('Message Body -->  ', record.body);
      // PROCESS HERE
      const msg = JSON.parse(record.body)
      const buffer = Buffer.from(record.body);
      updateDatabase(msg.id, msg.searchTerm, true)
      await s3.putObject({Bucket: process.env.S3_BUCKET, Key: `${msg.id}.json`, Body: buffer }, (err, output)=>{
        if(err){
          console.log(err.message);
        }
        console.log(output.ETag);
      }).promise()
    }
  } catch (error) {
    console.log(error);
  }
}
