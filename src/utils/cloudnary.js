import {v2 as cloudnary} from "cloudinary";
import fs from "fs";

import {v2 as cloudinary} from 'cloudinary';


const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file uploaded to cloudinary", response);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("file upload failed", error); // <--- log the full error
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '<your_cloud_name>',
  api_key: process.env.CLOUDINARY_API_KEY || '<your_api_key>',
  api_secret: process.env.CLOUDINARY_API_SECRET || '<your_api_secret>',
});

export {uploadCloudinary};