const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");

const s3Client = new S3Client();

exports.handler = async (event) => {
    console.log("--- Lambda Started ---");
    
    // 1. Get bucket and key
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

    console.log(`Step 1: Processing Bucket: ${bucket}, Key: ${key}`);

    // 2. Prevent infinite loop
    if (key.includes("/thumbnails/")) {
        console.log("Step 2: Skipping - file is already in thumbnails folder.");
        return;
    }

    try {
        // 3. Download the original image
        console.log("Step 3: Starting download from S3...");
        const getObjectParams = { Bucket: bucket, Key: key };
        const response = await s3Client.send(new GetObjectCommand(getObjectParams));
        
        // Robust way to convert stream to buffer
        const streamToBuffer = (stream) =>
            new Promise((resolve, reject) => {
                const chunks = [];
                stream.on("data", (chunk) => chunks.push(chunk));
                stream.on("error", reject);
                stream.on("end", () => resolve(Buffer.concat(chunks)));
            });

        const buffer = await streamToBuffer(response.Body);
        console.log(`Step 3: Download complete. Buffer size: ${buffer.length} bytes`);

        // 4. Resize the image
        console.log("Step 4: Starting image resize with Sharp...");
        const resizedBuffer = await sharp(buffer)
            .resize({ width: 300, withoutEnlargement: true })
            .toBuffer();
        console.log(`Step 4: Resize complete. New size: ${resizedBuffer.length} bytes`);

        // 5. Generate target key
        const keyParts = key.split("/");
        const filename = keyParts.pop();
        const folderPath = keyParts.join("/");
        const thumbnailKey = `${folderPath}/thumbnails/${filename}`;
        console.log(`Step 5: Target key generated: ${thumbnailKey}`);

        // 6. Upload back to S3
        console.log("Step 6: Uploading thumbnail to S3...");
        await s3Client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: thumbnailKey,
            Body: resizedBuffer,
            ContentType: response.ContentType || 'image/jpeg'
        }));

        console.log("--- SUCCESS: Thumbnail created successfully! ---");
        return { statusCode: 200, body: "Success" };

    } catch (error) {
        console.error("--- ERROR DETECTED ---");
        console.error("Error Message:", error.message);
        console.error("Error Stack:", error.stack);
        throw error;
    }
};
