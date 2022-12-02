const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Creating a S3 client
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY,
    },
    region: process.env.BUCKET_REGION
});

const getImageFromBucket = async (key) => {

    // Set params before sending the request
    const getObjParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: key,
    }

    // Send a get request for the image
    const getObjCommand = new GetObjectCommand(getObjParams);
    const url = await getSignedUrl(s3, getObjCommand, { expiresIn: 3600 });

    // Set the fetch url to the image
    return url;

};

module.exports = getImageFromBucket;