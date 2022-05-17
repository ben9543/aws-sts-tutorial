import AWS from 'aws-sdk';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import express from "express";
const router = express.Router();

router.get("/auth", (req, res) => {
    return res.send("/api/v1/auth");
});

router.get("/sts/token", (req, res) => {
    var sts = new AWS.STS({apiVersion: '2011-06-15'});
    var params = {
        RoleArn: "arn:aws:iam::185197443529:role/DemoRoleForS3AndSTS",
        RoleSessionName: "DemoRoleForS3AndSTS"
       };
    sts.assumeRole(params, async function(err, data) {
         if (err) console.log(err, err.stack); // an error occurred
         else{
            let bufferArray = [];
            try {
                const { Credentials: {AccessKeyId, SecretAccessKey, SessionToken} } = data;
                const params = {
                    Bucket: "demo-ben-replica-20212021", // The name of the bucket. For example, 'sample_bucket_101'.
                    Key: "index.html"
                };
                const credentials = {
                    accessKeyId:AccessKeyId,
                    secretAccessKey:SecretAccessKey,
                    sessionToken: SessionToken
                };
                /*const credentials = {
                    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
                };*/
                let s3Client = new S3Client({ region: "us-east-1", credentials});
                const command = new GetObjectCommand(params);
                const url = await getSignedUrl(s3Client, command, { expiresIn: 2400 });
                return res.json({url});

                // Attach a 'data' listener to add the chunks of data to our array
                // Each chunk is a Buffer instance
                // results.Body.on('data', chunk => console.log(chunk.toString()))
                // Once the stream has no more data, join the chunks into a string and return the string
                // console.log(bufferArray.join(''))
                // return res.send(bufferArray.join('')); // For unit tests.
              } catch (err) {
                console.log("Error", err);
              }
        }
    });
});

export default router;

