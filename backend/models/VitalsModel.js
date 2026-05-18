import { Schema, model } from "mongoose";

const vitalsSchema = new Schema({
    patientId: {
        type: Schema.Types.ObjectId,
        ref: "patient",
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    bloodPressure: {
        type: String, // e.g., "120/80"
        default: ""
    },
    heartRate: {
        type: Number, // bpm
        default: null
    },
    sugarLevel: {
        type: Number, // mg/dL
        default: null
    },
    weight: {
        type: Number, // kg
        default: null
    },
    temperature: {
        type: Number, // Fahrenheit
        default: null
    }
}, { timestamps: true });

export const VitalsModel = model("vitals", vitalsSchema);
