import { Schema, model } from "mongoose";

const prescriptionSchema = new Schema({

    patientId: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },

    doctorId: {
        type: Schema.Types.ObjectId,
        ref: "doctor"
    },

    age: Number,
    
    gender: String,
    
    prescriptionDate: {
        type: Date,
        default: Date.now
    },

    medicines: [
        {
            medicineName: String,
            dosage: String,
            duration: String
        }
    ],

    notes: String,

    // Cloudinary URL of the uploaded handwritten prescription image
    handwrittenImageUrl: {
        type: String,
        default: null
    },

    // OCR-extracted text from the handwritten image (populated by frontend Tesseract)
    ocrExtractedText: {
        type: String,
        default: null
    }

}, { timestamps: true });

export const PrescriptionModel = model("prescription", prescriptionSchema);