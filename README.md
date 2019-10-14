# medium-parser
Lambda that extracts, transforms, and loads Medium articles to S3 for use in our website.

## initial logic
- list objects in medium-html bucket
  - as you iterate through each object,
    - push object meta-data to an array
    - copy entire object content to a temporary variable
      - change that temporary variable by taking out everything between and including <style></style>
      - update the object in S3 with the new value of the temporary value
      
- update the Index.js (table of contents object) with the updated meta-data array

## other logic
- Remove all files that are comment posts not article posts, i.e., files under 10 KB in size.
- Remove the "Exported from Medium" part and the logo from the html files.
- Also remove:
  - "on June 6, 2019."
  - "Canonical link"
  - Exported from Medium on June 30, 2019."
- Also look into possibly removing external scripts from the html files.
- Also remove the H3 duplicate of the H1 header.
- Apply a CloudWatch cron job to do the necessary tasks daily.

# Format of the metadata.json array:
```
[  
   {  
      "path":"2018-06-10_Guide--First-Serverless-Project-630b91366505",
      "title":"Guide: First Serverless Project",
      "img":"https://cdn-images-1.medium.com/max/800/1*CuALG7dV2rLky1sapJbnUQ.png",
      "subtitle":"Let’s learn about the Serverless Framework!"
   },
   {  
      "path":"2018-06-10_Serverless---What--why--how--126d60d95323",
      "title":"Serverless!? What, why, how?",
      "img":"https://cdn-images-1.medium.com/max/800/1*qKIyMwSWX8SX2VRmVi4JBg.png",
      "subtitle":"Let’s take a look at something called Serverless."
   },
]
```

# Future improvements:
- Refactor/optimize the Lambda function
- Perhaps use Python insead, and use something like Beautiful Soup
- Optimize the serverless deployment so that the first step that happens when running `sls deploy` is checking whether the s3 bucket name chosen is available.
- Maybe add versioning to the bucket, so if the code gets tweaked, and all the articles get overwritten, you can go back.