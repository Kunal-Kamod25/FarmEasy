# AWS Lambda Image Resizer Setup Guide 🚀

Follow these steps to set up your automatic image resizer in the AWS Console.

---

## 1️⃣ STEP 1: Create an IAM Role (Permissions)
The Lambda function needs permission to read images from S3 and save the thumbnails back.

1.  Go to **IAM Console** → **Roles** → **Create role**.
2.  Select **AWS Service** → **Lambda**.
3.  Click **Next**.
4.  Search for and attach these policies:
    *   `AmazonS3FullAccess` (Simplest for now)
    *   `AWSLambdaBasicExecutionRole` (Allows logging to CloudWatch)
5.  Click **Next**.
6.  **Role name:** `farmeasy-lambda-s3-role`.
7.  Click **Create role**.

---

## 2️⃣ STEP 2: Bundle and Prepare Your Code
Since the Lambda uses the `sharp` library, we need to install the version compatible with Linux (which is what AWS Lambda runs on).

**Run these commands in your terminal (inside `aws-lambda/image-resizer`):**

```bash
cd aws-lambda/image-resizer

# This installs the Linux version of sharp even if you are on Windows
npm install --arch=x64 --platform=linux sharp
```

**After running the command:**
1.  Select `index.js`, `package.json`, and the `node_modules` folder.
2.  Right-click → **Compress to ZIP file**.
3.  Name it `lambda-function.zip`.

---

## 3️⃣ STEP 3: Create the Lambda Function
1.  Go to **AWS Lambda Console** → **Functions** → **Create function**.
2.  Select **Author from scratch**.
3.  **Function name:** `farmeasy-image-resizer`.
4.  **Runtime:** `Node.js 18.x` (or 20.x).
5.  **Architecture:** `x86_64`.
6.  **Permissions:** Expand "Change default execution role" → Select **Use an existing role** → Choose `farmeasy-lambda-s3-role` (from Step 1).
7.  Click **Create function**.

---

## 4️⃣ STEP 4: Upload Your Code
1.  In the **Code** tab of your new function, click **Upload from** → **.zip file**.
2.  Select the `lambda-function.zip` you created in Step 2.
3.  Click **Save**.

---

## 5️⃣ STEP 5: Add the S3 Trigger (The "Magic" Part)
1.  On the Lambda Function page, click **Add trigger**.
2.  Select **S3** from the list.
3.  **Bucket:** `farmeasy-uploads`.
4.  **Event type:** `All object create events`.
5.  **Prefix:** `farmeasy/` (This ensures it only triggers for your project files).
6.  **Recursive invocation warning:** Check the box "I acknowledge..." (Don't worry, our code has a check to prevent this).
7.  Click **Add**.

---

## ✅ Testing Your Setup
1.  Go to the **FarmEasy Vendor Dashboard**.
2.  Upload a new product image.
3.  Wait 5-10 seconds.
4.  Check your S3 bucket! You should see a new folder:
    `farmeasy/thumbnails/`
5.  Inside that folder, you should find a smaller version of your uploaded image.

> [!TIP]
> If it doesn't work, check the **Monitor** tab → **View CloudWatch logs** in the Lambda console to see what went wrong.
