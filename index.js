const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Bucket = 'medium-html';
const listParams = { Bucket };

// this Lambda has full permissions for S3's medium-html (specify that in serverless.yml)
// also backup daily to another bukect to which no one and no service has delete access
exports.handler = async (event, context, callback) => {
    const metadata = [];

    try {
        // List objects in bucket
        const s3Objects = await s3.listObjectsV2(listParams).promise();

        const objectKeys = [];
        s3Objects.Contents.forEach(obj => {
            if (obj.Size < 10000)
                s3.deleteObject({ Bucket, Key: obj.Key}).promise(); // delete comment posts
            else
                objectKeys.push(obj.Key); // Get object keys
        });

        // Iterate through each object key
        for (key of objectKeys) {
            // Get an S3 object
            const article = await s3.getObject({ Bucket, Key: key }).promise();
            const original = article.Body.toString('utf-8');

            // Customize the S3 object's text based on your needs
            const Body = original
                .replace(/<style>.*<\/style>/is, '')
                .replace(/What did we miss.*footer>/is, '')
                .replace(/>https.{33}polly.{82}</i, '>Listen to article as Audio by Amazon Polly<');

            // Populate metadata array
            const path = key.slice(0, -5);
            const title = original.match(/<h1 class="p-name">.{1,300}<\/h1>/)[0].slice(19, -5);
            metadata.push({ path, title }); // push({ path, title, img, subtitle })

            // Update S3 with the changes
            await s3.putObject({ Bucket, Key: key, Body, ACL: 'public-read' }).promise();
        }

        console.log(metadata);
        callback(null, 'Success!');
    } catch (err) {
        callback(err.message);
    }

    // console.log('printing all metadata:')
    // console.log(metadata);
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
