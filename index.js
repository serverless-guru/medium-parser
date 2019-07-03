const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Bucket = 'medium-html';
const listParams = { Bucket };

// this Lambda has full permissions for S3's medium-html (specify that in serverless.yml)
// also backup daily to another bukect to which no one and no service has delete access
exports.handler = async (event, context, callback) => {
    const metaData = [];

    try {
        // List objects in bucket
        const s3Objects = await s3.listObjectsV2(listParams).promise();

        // Get object keys
        const objectKeys = [];
        s3Objects.Contents.forEach(obj => {
            objectKeys.push(obj.Key);
        });

        // Iterate through each object key
        for (key of objectKeys) {
            // Get an S3 object
            const article = await s3.getObject({ Bucket, Key: key }).promise();
            const original = article.Body.toString('utf-8');

            // Transform the S3 object
            const stylefree = original.replace(/<style>.*<\/style>/is, '');

            // Update S3 with the changes
            await s3.putObject({ Bucket, Key: key, Body: stylefree, ACL: 'public-read' }).promise();
        }

        callback(null, 'Success!');
    } catch (err) {
        callback(err.message);
    }

    //     if (obj.Size < 10000) {
    //         console.log(`Deleting ${obj.Key}, with size of ${obj.Size}...`);
    //         s3.deleteObject(objParams, (err, res) => {
    //             console.log(err, res);
    //         });
    //         return;
    //     }

    //     const path = obj.Key.slice(0, -5); // remove '.html'
    //     metaData.push({
    //         path,
    //     })
    // });

    // console.log('printing all metadata:')
    // console.log(metaData);
    // as you iterate through each object,
    // push object meta-data to an array

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

// set lambda timeout to 1 minute

// {
//     "Version": "2012-10-17",
//         "Statement": [
//             {
//                 "Sid": "VisualEditor0",
//                 "Effect": "Allow",
//                 "Action": [
//                     "s3:PutObject",
//                     "s3:PutObjectTagging",
//                     "s3:PutObjectAcl"
//                 ],
//                 "Resource": "arn:aws:s3:::medium-html/*"
//             }
//         ]
// }
