'use strict';

import { S3 } from 'aws-sdk'

let s3 = new S3();
if(process.env.LOCALSTACK_HOSTNAME && process.env.LOCALSTACK_HOSTNAME!==''){
  const options = {endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`}
  s3 = new S3({...options, s3ForcePathStyle: true});
}

module.exports.files = async (event, context, callback) => {
  // fetch all jobs from the database
  // For production workloads you should design your tables and indexes so that your applications can use Query instead of Scan.
  const listResults = await s3.listObjectsV2({Bucket: process.env.S3_BUCKET}).promise();
  const response = {
    statusCode: 200,
    body: JSON.stringify(listResults.Contents),
  };
  callback(null, response);
};
