const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Bucket = 'medium-html';
const listParams = { Bucket };
var readline = require('readline');

// this Lambda has full permissions for S3's medium-html (specify that in serverless.yml)
// also backup daily to another bukect to which no one and no service has delete access
exports.handler = async (event) => {
    const metaData = [];
    // list objects in medium-html bucket
    const response = await s3.listObjectsV2(listParams).promise();
    response.Contents.forEach(obj => {
        const objParams = { Bucket, Key: obj.Key };
        if (obj.Size < 10000) {
            console.log(`Deleting ${obj.Key}, with size of ${obj.Size}...`);
            s3.deleteObject(objParams, (err, res) => {
                console.log(err, res);
            });
            return;
        }
        s3.getObject(objParams, function (err, data) {
            // Handle any error and exit
            if (err)
                return err;
            // Convert Body from a Buffer to a String
            const original = data.Body.toString('utf-8'); // Use the encoding necessary
            const stylefree = original.replace(/<style>.*<\/style>/is, '');
            console.log(stylefree)
            // s3.putObject({ Body: stylefree, Bucket, Key: obj.Key, Tagging: "destyled=true" }, function (err, data) {
            //     if (err) console.log(err, err.stack); // an error occurred
            //     else console.log(data);           // successful response
            // });
        });

        const path = obj.Key.slice(0, -5); // remove '.html'
        metaData.push({
            path,
        })
    });


    // get title by finding `<h1 class="p-name">` and deleting everything between that and `</h1>`.

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

// set lambda timeout to 1 minute


// {
//     "Version": "2012-10-17",
//         "Statement": [
//             {
//                 "Sid": "VisualEditor0",
//                 "Effect": "Allow",
//                 "Action": [
//                     "s3:PutObject",
//                     "s3:PutObjectTagging"
//                 ],
//                 "Resource": "arn:aws:s3:::medium-html/"
//             }
//         ]
// }