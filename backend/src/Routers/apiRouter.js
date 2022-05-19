require('dotenv').config();

import { S3Client, GetObjectCommand, PutObjectCommand, HeadBucketCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { STS } from "@aws-sdk/client-sts";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import express from "express";
import fetch from "node-fetch"
import multer from "multer";
import fs from "fs";
import path from "path";
const router = express.Router();

const stsParams = {
    RoleArn: process.env.ROLE_ARN_TO_ASSUME,
    RoleSessionName: "DemoRoleForS3AndSTS"
};

const sts = new STS({
    apiVersion: '2011-06-15', 
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
    }
});

const doesExistBucketOrObject = async({s3Client, bucketParams, objectParams}) => {
    // Check if the bucket exists
    const headBucketCommand = new HeadBucketCommand(bucketParams);
    await s3Client.send(headBucketCommand)
        .catch(err => {
            throw {statusCode:err.$metadata.httpStatusCode, message:`Bucket ${err.name}`};
    });
    
    // Check if the object exists
    const headObjectCommand = new HeadObjectCommand(objectParams);
    await s3Client.send(headObjectCommand)
        .catch(err => {
            throw {statusCode:err.$metadata.httpStatusCode, message:`Object ${err.name}`};
    });
}

router.get("/auth", (req, res) => {
    return res.send("/api/v1/auth");
});

router.get("/item", (req, res) => {
    if (req.query === undefined) 
        return res.json({error:"Invalid QueryStrings"});
    
    const { bucket, key, region } = req.query;
    if (bucket === undefined || region === undefined || key === undefined) 
        return res.json({error:"Invalid QueryStrings"});

    // STS AssumeRole token
    sts.assumeRole(stsParams, async function(error, data) {
         if (error) return res.status(error.statusCode).json({error:error.message});
         else{
            try { 
                const { Credentials: { AccessKeyId, SecretAccessKey, SessionToken } } = data;
                const bucketParams = {
                    Bucket: bucket
                }
                const getObjectParams = {
                    Bucket: bucket, // The name of the bucket. For example, 'sample_bucket_101'.
                    Key: key
                };
                const credentials = {
                    accessKeyId: AccessKeyId,
                    secretAccessKey: SecretAccessKey,
                    sessionToken: SessionToken
                };
                let s3Client = new S3Client({ region, credentials });
                
                // Check
                await doesExistBucketOrObject({s3Client, bucketParams, objectParams:getObjectParams});
                
                // Returning Pre-signed URL
                const getObjCommand = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3Client, getObjCommand, { expiresIn: 2400 });
                return res.json({url, success:true});
            
            } catch (error) {
                return res.status(error.statusCode).json({error, success:false});
            }
        }
    });
});

const upload = multer({ dest: 'uploads/' });

router.post("/item", upload.single("files"),(req, res) => {
    if (req.body === undefined || req.body === null) 
    return res.json({error:"Invalid QueryParameters: req.body"});

    const { bucket, key, region } = req.body;
    if (bucket === undefined || region === undefined || key === undefined) 
        return res.json({error:"Invalid QueryParameters"});
    if (req.file === undefined)
        return res.json({error:"No file attached"})
    
    const { filename, path:filepath } = req.file;
    console.log(filename, filepath);
    const realpath = path.join(__dirname.split("src")[0], filepath);
    const realfile = fs.readFileSync(realpath);
    // STS AssumeRole token
    sts.assumeRole(stsParams, async function(error, data) {
        if (error) return res.status(error.statusCode).json({error:error.message});
        else{
            try{

                // STS
                const { Credentials: { AccessKeyId, SecretAccessKey, SessionToken } } = data;
                const credentials = {
                    accessKeyId: AccessKeyId,
                    secretAccessKey: SecretAccessKey,
                    sessionToken: SessionToken
                };

                const putObjectParams = { 
                    Bucket: bucket, 
                    Key: key
                }

                let s3Client = new S3Client({ region, credentials });
                const putObjectCommand = new PutObjectCommand(putObjectParams);
                const signedUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 2400 })
                    .catch(err => {throw err});
                const response = await fetch(signedUrl, {method: 'PUT', body: realfile})
                    .catch(err => {throw err;});
                console.log("Successfully uploaded the object");
                return res.status(response.status).json({success:true})
            } catch(error) {
                return res.json({error})
            }
        }
    });
});


export default router;

