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
