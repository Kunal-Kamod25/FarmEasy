// ===========================================================================
// AWS S3 Configuration
// ===========================================================================
const AWS = require('aws-sdk');

console.log('\n🔍 AWS S3 Configuration:');
console.log('  Region:', process.env.AWS_REGION);
console.log('  Bucket Name:', process.env.AWS_S3_BUCKET_NAME);
console.log('  Access Key:', process.env.AWS_ACCESS_KEY_ID ? '✓ Set' : '❌ NOT SET');
console.log('  Secret Key:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Set' : '❌ NOT SET');

// Configure AWS SDK with credentials from environment variables
const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Test connection on startup
if (!process.env.AWS_S3_BUCKET_NAME) {
  console.error('❌ AWS_S3_BUCKET_NAME is not set in .env file');
} else {
  s3.headBucket({ Bucket: process.env.AWS_S3_BUCKET_NAME }, (err) => {
    if (err) {
      console.error('❌ AWS S3 Bucket Error:', err);
      if (err.code === 'NoSuchBucket') {
        console.error('   → Bucket does not exist. Create it in AWS console.');
      } else if (err.code === 'Forbidden') {
        console.error('   → Access denied. Check IAM permissions.');
      } else if (err.code === 'InvalidAccessKeyId') {
        console.error('   → Invalid AWS Access Key ID.');
      } else if (err.code === 'SignatureDoesNotMatch') {
        console.error('   → Invalid AWS Secret Access Key.');
      }
    } else {
      console.log('✅ AWS S3 Connected successfully:', process.env.AWS_S3_BUCKET_NAME);
    }
  });
}

module.exports = s3;