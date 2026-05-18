import exp from "express";
import { PrescriptionModel } from "../models/PrescriptionModel.js";
import { upload } from "../config/multer.js";
import { cloudinaryUpload } from "../config/cloudinaryUpload.js";

export const prescriptionApp = exp.Router();


// ─── ADD PRESCRIPTION ─────────────────────────────────────────────────────────
prescriptionApp.post("/add", async (req, res, next) => {
    try {
        const prescription = await PrescriptionModel.create(req.body);

        res.status(201).json({
            message: "Prescription added",
            payload: prescription
        });

    } catch (err) {
        next(err);
    }
});


// ─── UPLOAD HANDWRITTEN PRESCRIPTION IMAGE (Cloudinary) ──────────────────────
prescriptionApp.post(
    "/upload-image",
    upload.single("prescriptionImage"),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No image file provided" });
            }

            const result = await cloudinaryUpload(req.file.path);

            res.status(200).json({
                message: "Image uploaded successfully",
                payload: {
                    url:       result.secure_url,
                    publicId:  result.public_id,
                    format:    result.format,
                    width:     result.width,
                    height:    result.height
                }
            });

        } catch (err) {
            next(err);
        }
    }
);


// ─── GET PRESCRIPTIONS BY PATIENT ────────────────────────────────────────────
prescriptionApp.get("/patient/:patientId", async (req, res, next) => {
    try {
        const prescriptions = await PrescriptionModel.find({
            patientId: req.params.patientId
        })
        .populate("patientId", "name age gender bloodGroup")
        .populate("doctorId", "name specialization")
        .sort({ createdAt: -1 });

        res.status(200).json({ payload: prescriptions });

    } catch (err) {
        next(err);
    }
});


// ─── GET PRESCRIPTIONS BY DOCTOR ─────────────────────────────────────────────
prescriptionApp.get("/doctor/:doctorId", async (req, res, next) => {
    try {
        const prescriptions = await PrescriptionModel.find({
            doctorId: req.params.doctorId
        })
        .populate("patientId", "name age gender bloodGroup")
        .sort({ createdAt: -1 });

        res.status(200).json({ payload: prescriptions });

    } catch (err) {
        next(err);
    }
});


// ─── GET ALL PRESCRIPTIONS (admin) ───────────────────────────────────────────
prescriptionApp.get("/all", async (req, res, next) => {
    try {
        const prescriptions = await PrescriptionModel.find()
        .populate("patientId", "name age gender bloodGroup")
        .populate("doctorId", "name specialization")
        .sort({ createdAt: -1 });

        res.status(200).json({ payload: prescriptions });

    } catch (err) {
        next(err);
    }
});