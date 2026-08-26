import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.Cloud_Name,
    api_key: process.env.Cloud_Api,
    api_secret: process.env.Cloud_Sec
});
 console.log("Cloud Name:", process.env.Cloud_Name);
console.log("Cloud API:", process.env.Cloud_Api);
console.log("Cloud Secret:", process.env.Cloud_Sec ? "Loaded" : "Missing");
const uploadCloud = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("No local file path provided");
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("File uploaded successfully:", response.url);

        // Delete temporary file after successful upload
        fs.unlinkSync(localFilePath);

        return response;
      
    } catch (error) {
        console.log("Cloudinary upload error:", error);

        // Delete temporary file even if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

export { uploadCloud };