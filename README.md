## AWS STS AssumeRole Tutorial

#### Steps

1. Admin creates a role that grants Development account read/write access
2. Admin grants members of the group Developers permission to assume the created role
3. User requests access to the role to STS
4. STS returns the role temporary credentials
5. User access AWS resources by using the role credentials

#### APIs

- `GET`
  - `/api/v1/item`
    - Queries
      - `bucket`: S3 bucket name 
      - `key`: S3 bucket object ID
      - `region`: S3 bucket region

- `POST`
  - `/api/v1/item`
    - Queries
      - `bucket`: S3 bucket name 
      - `key`: S3 bucket object ID
      - `region`: S3 bucket region
      - `files`: File data to upload