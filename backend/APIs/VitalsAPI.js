import exp from "express";
import { VitalsModel } from "../models/VitalsModel.js";
import { AppointmentModel } from "../models/AppointmentModel.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

export const vitalsApp = exp.Router();

// Add new vitals log
vitalsApp.post("/add", VerifyToken, async (req, res, next) => {
    try {
        const vitals = await VitalsModel.create(req.body);
        res.status(201).json({
            message: "Vitals logged successfully",
            payload: vitals
        });
    } catch (err) {
        next(err);
    }
});

// Get vitals history for a patient
vitalsApp.get("/patient/:patientId", VerifyToken, async (req, res, next) => {
    try {
        const history = await VitalsModel.find({ patientId: req.params.patientId })
            .sort({ date: 1 }); // Ascending order for charts
        res.status(200).json({
            payload: history
        });
    } catch (err) {
        next(err);
    }
});

// Check if patient has at least one completed appointment (Health Diary eligibility)
vitalsApp.get("/check-eligibility/:patientId", VerifyToken, async (req, res, next) => {
    try {
        const completed = await AppointmentModel.findOne({
            patientId: req.params.patientId,
            status: "Completed"
        });
        res.status(200).json({ eligible: Boolean(completed) });
    } catch (err) {
        next(err);
    }
});

// Delete a vitals record
vitalsApp.delete("/:id", VerifyToken, async (req, res, next) => {
    try {
        const deleted = await VitalsModel.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Vitals record not found" });
        }
        res.status(200).json({ message: "Vitals record deleted successfully" });
    } catch (err) {
        next(err);
    }
});
