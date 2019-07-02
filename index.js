const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Bucket = 'medium-html';
const listParams = { Bucket };

// this Lambda has full permissions for S3's medium-html (specify that in serverless.yml)
// also backup daily to another bukect to which no one and no service has delete access
exports.handler = async (event) => {
    const metaData = [];
    // list objects in medium-html bucket
    const response = await s3.listObjectsV2(listParams).promise();
    response.Contents.forEach(obj => {
        if (obj.Size < 10000) {
            const deleteParams = { Bucket, Key: obj.Key };
            s3.deleteObject(deleteParams, (err, res) => {
                console.log(err, res);
            }); // S3 is eventually consistent...results may not be immediate.
        }
        console.log(obj);
        const path = obj.Key.slice(0, -5); // remove '.html'
        metaData.push({
            path,
        })
    });
    console.log('printing all metadata:')
    console.log(metaData);
    // as you iterate through each object,
    // push object meta-data to an array
    // copy entire object content to a temporary variable
    // change that temporary variable by taking out everything between and including <style></style>
    // update the object in S3 with the new value of the temporary value

    // update the Index.js (table of contents object) with the updated meta-data array
}

// objects in array of meta data:
// {
//     path: '2019-06-06_You-Can-Build-a-Bank-With-These-APIs--Not-Those-3536885c69c6',
//         title: 'You Can Build a Bank With These APIs, Not Those',
//             img: 'https://cdn-images-1.medium.com/max/800/0*AZb2NkROIhP3k4WI',
//                 subtitle: 'No mail- order brides, no human hair, and no money service businesses.These rules are part of Braintree’s Acceptable Use Policy.'
// }



// {
//     "Version": "2012-10-17",
//         "Statement": [
//             {
//                 "Sid": "VisualEditor0",
//                 "Effect": "Allow",
//                 "Action": "s3:DeleteObject",
//                 "Resource": "arn:aws:s3:::medium-html/*"
//             }
//         ]
// }