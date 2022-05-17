import { S3Client, GetObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { STS } from "@aws-sdk/client-sts";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import express from "express";
const router = express.Router();

router.get("/auth", (req, res) => {
    return res.send("/api/v1/auth");
});

router.get("/item", (req, res) => {
    if (req.query === undefined) 
        return res.json({error:"Invalid QueryStrings"});
    
    const { bucket, key, region } = req.query;
    if (bucket === undefined || region === undefined || key === undefined) 
        return res.json({error:"Invalid QueryStrings"});

    const sts = new STS({
        apiVersion: '2011-06-15', 
        credentials:{
            accessKeyId:process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
        }
    });
    const params = {
        RoleArn: "arn:aws:iam::185197443529:role/DemoRoleForS3AndSTS",
        RoleSessionName: "DemoRoleForS3AndSTS"
    };
    
    // STS AssumeRole token
    sts.assumeRole(params, async function(error, data) {
         if (error) return res.status(error.statusCode).json({error:error.message});
         else{
            try { 
                const { Credentials: { AccessKeyId, SecretAccessKey, SessionToken } } = data;
                const bucketParams = {
                    Bucket: bucket, // The name of the bucket. For example, 'sample_bucket_101'.
                    Key: key
                };
                const credentials = {
                    accessKeyId: AccessKeyId,
                    secretAccessKey: SecretAccessKey,
                    sessionToken: SessionToken
                };
                let s3Client = new S3Client({ region, credentials });
                
                // Check if the bucket exists
                const headBucketCommand = new HeadBucketCommand({Bucket:bucket});
                await s3Client.send(headBucketCommand)
                    .catch(err => {throw err})
                
                // Returning Pre-signed URL
                const getObjCommand = new GetObjectCommand(bucketParams);
                const url = await getSignedUrl(s3Client, getObjCommand, { expiresIn: 2400 });
                return res.json({url});
            
            } catch (error) {
                if (error.$metadata && error.name)return res.status(error.$metadata.httpStatusCode).json({error:error.name});
                else return res.status(403).json({error});
            }
        }
    });
});

router.post("/item", (req, res) => {
    if (req.query === undefined) 
    return res.json({error:"Invalid QueryParameters"});

    const { bucket, key, region, files } = req.query;
    if (bucket === undefined || region === undefined || key === undefined || files === undefined) 
        return res.json({error:"Invalid QueryParameters"});

    const sts = new STS({
        apiVersion: '2011-06-15', 
        credentials:{
            accessKeyId:process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
        }
    });
    const params = {
        RoleArn: "arn:aws:iam::185197443529:role/DemoRoleForS3AndSTS",
        RoleSessionName: "DemoRoleForS3AndSTS"
    };

    // STS AssumeRole token
    sts.assumeRole(params, async function(error, data) {
        if (error) return res.status(error.statusCode).json({error:error.message});
        else{}
    });


});


export default router;

