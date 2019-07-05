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
                s3.deleteObject({ Bucket, Key: obj.Key }).promise(); // delete comment posts
            else
                objectKeys.push(obj.Key); // Get object keys
        });

        // Iterate through each object key
        for (key of objectKeys) {
            if (key === "metadata.json") continue;

            // Get an S3 object
            const article = await s3.getObject({ Bucket, Key: key }).promise();
            const original = article.Body.toString('utf-8');

            // In some articles, this subtitle is the same as the other subtitle, in some it's different
            // and in some, it's not there. So comment it out. That way you can come back to it if needed.
            const altSubtitle = original.match(/<section data-field="subtitle".{1,300}<\/section>/is);

            // Customize the S3 object's text based on your needs
            const Body = original
                .replace(/<style>.*<\/style>/is, '')
                .replace(/<h4.{400,700}on Twitter.<\/p>/, '') // because we don't have a comments box yet
                .replace(/>.?<section data-field="subtitle".{1,300}<\/section>.?</is, `><!--${altSubtitle}--><`)
                .replace(/<h3.{30,100}graf--title.{5,100}<\/h3>/is, '') // remove duplicate title
                .replace(/<p.{200,350}please follow us.{500,1200}p>.{1,4}div/is, '</div') // remove social links section
                .replace(/<figure.{100,300}image.{100,300}serverlessguru.{100,300}<\/figure>/is, '') //remove SG logo

                // {300,600} makes it more specific, thereby lowering the chance of deleting a code example in the article:
                .replace(/section>.?<footer>.{300,600}footer>/is, 'section>')
                .replace(/>https.{33}polly.{82}</i, '>Listen to article as Audio by Amazon Polly<');

            // Populate metadata array
            const path = key.slice(0, -5);


            const title = original.match(/<h1 class="p-name">.{1,300}<\/h1>/)[0].slice(19, -5);
            const imgMatch = original.match(/https:\/\/cdn-images-\d\.medium\.com\/.{10,50}\.(jpeg|png|gif)/i);
            const img = imgMatch ? imgMatch[0] : '';
            const subtitleMatch = original.match(/graf--subtitle">.{1,500}<\/h4/i);

            const altSubtitleContent = altSubtitle[0].slice(49, -10);

            // fix the altSubtitleMatch to work for the `Google Cloud Build — Push Docker Images` article
            let subtitle;
            if (subtitleMatch)
                subtitle = subtitleMatch[0].slice(16, -4);
            else if (!altSubtitleContent)
                subtitle = '';
            else if (altSubtitleContent.length > 10)
                subtitle = altSubtitleContent;
            else 
                subtitle = '';
            const h3Tags = original.match(/<h3.{1,200}<\/h3>/gis);
            const author = h3Tags[h3Tags.length - 1].slice(67, -5);
            metadata.push({ path, title, img, subtitle, author });


            // Update S3 with the changes
            await s3.putObject({ Bucket, Key: key, Body, ACL: 'public-read' }).promise();
        }

        console.log(metadata);
        await s3.putObject({ Bucket, Key: 'metadata.json', Body: JSON.stringify(metadata), ACL: 'public-read' }).promise();
        callback(null, 'Success!');
    } catch (err) {
        callback(err.message);
    }
}

// Settings to add in the serverless.yml:
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
