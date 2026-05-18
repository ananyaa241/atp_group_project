import cloudinary from "./cloudinary.js";

export const cloudinaryUpload = async (filePath) => {

    return await cloudinary.uploader.upload(filePath, {
        folder: "hospital-management"
    });

};