const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET = 'medium-html';

// this Lambda has full permissions for S3's medium-html (specify that in serverless.yml)
// also backup daily to another bukect to which no one and no service has delete access
exports.handler = async (event) => {
// list objects in medium-html bucket
s3.listObjectsV2({ Bucket: BUCKET })
    .then(res => {
        console.log(res);
    })
    .catch(err => {
        console.log(err);
    });
    // as you iterate through each object,
      // push object meta-data to an array
      // copy entire object content to a temporary variable
      // change that temporary variable by taking out everything between and including <style></style>
      // update the object in S3 with the new value of the temporary value

  // update the Index.js (table of contents object) with the updated meta-data array
}