# AWS STS Tutorial

## Purpose

- To understand how AWS STS `AssumeRole` API works by implementing small web application.
- To use AWS SDK with AWS S3 to upload files.
- To practice uploading files using frontend and backend using JavaScript & Node js.

## Steps
1. Client request API server(backend) to upload files.
2. At the backend, process the reqeust with multer library and store the file to `upload/` directory (middleware)
3. Request temporary credentials from STS. The role ARN that we want to assume needs to be set as `ROLE_ARN_TO_ASSUME` environment variable.
   - The role needs to have `S3:GetObject`, `S3:PutObject`, and `S3:ListObject` permission. 
   - IAM user that we are using to request the temporary credentials need to have `STS:AssumeRole` permission for the IAM role.
    ```json
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "VisualEditor0",
                    "Effect": "Allow",
                    "Action": "sts:AssumeRole",
                    "Resource": "arn:aws:iam::<ACCOUNT_ID>:role/<ROLE_ARM_TO_ASSUME>"
                }
            ]
        }
    ```
   - IAM role needs to have trust entities(Trust relationships) that includes the IAM user.
    ```json
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "AWS": [
                            "arn:aws:iam::<ACCOUNT_ID>:user/<IAM_USER_1>",
                            "arn:aws:iam::<ACCOUNT_ID>:user/<IAM_USER_2>",
                            // ... more
                        ]
                    },
                    "Action": "sts:AssumeRole"
                }
            ]
        }
    ```
4. Use the temporary credentials to upload files to a S3 bucket.
5. We successfully used the permission of IAM role (`S3:PutObject`) without directly getting its credentials.