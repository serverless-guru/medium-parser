const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Bucket = 'medium-html';
const listParams = { Bucket };

// this Lambda has full permissions for S3's medium-html (specify that in serverless.yml)
// also backup daily to another bukect to which no one and no service has delete access
exports.handler = async (event) => {
    const allKeys = [];
    // list objects in medium-html bucket
    const response = await s3.listObjectsV2(listParams).promise();
    response.Contents.forEach(obj => {
        if (obj.Size < 10000) {
            const deleteParams = { Bucket, Key: obj.Key };
            s3.deleteObject(deleteParams).promise(); // S3 is eventually consistent...results may not be immediate.
        }
        console.log(obj);
        return allKeys.push(obj.Key);
    });
    console.log('printing all keys:')
    console.log(allKeys);
    // as you iterate through each object,
    // push object meta-data to an array
    // copy entire object content to a temporary variable
    // change that temporary variable by taking out everything between and including <style></style>
    // update the object in S3 with the new value of the temporary value

    // update the Index.js (table of contents object) with the updated meta-data array
}