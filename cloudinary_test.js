const cloudinary = require("cloudinary").v2;

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: "dpmvr2uck",
  api_key: "978362679315839",
  api_secret: "BYx_IqJRaeNvryvwB7foRxdVQj4",
});

async function runCloudinaryTask() {
  try {
    console.log("Starting Cloudinary Onboarding Script...\n");

    // 2. Upload an image
    console.log("Uploading demo image...");
    const uploadResult = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      {
        public_id: "everafter_demo_sample",
      }
    );
    console.log("Upload successful!");
    console.log("Secure URL:", uploadResult.secure_url);
    console.log("Public ID:", uploadResult.public_id, "\n");

    // 3. Get image details
    console.log("Fetching image details...");
    const details = await cloudinary.api.resource(uploadResult.public_id);
    console.log("Width:", details.width, "px");
    console.log("Height:", details.height, "px");
    console.log("Format:", details.format);
    console.log("File Size:", details.bytes, "bytes\n");

    // 4. Transform the image
    console.log("Generating transformed image URL...");
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: "auto", // f_auto: automatically selects the best format (like WebP/AVIF) based on the requesting browser
      quality: "auto", // q_auto: automatically adjusts the compression quality to reduce file size without visible degradation
    });

    console.log(
      "Done! Click link below to see optimized version of the image. Check the size and the format."
    );
    console.log(transformedUrl);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

runCloudinaryTask();
