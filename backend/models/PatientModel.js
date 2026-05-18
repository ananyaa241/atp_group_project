import { Schema, model } from "mongoose";

const patientSchema = new Schema({

    name: String,

    email: {
        type: String,
        unique: true
    },

    password: String,

    age: Number,

    gender: String,

    bloodGroup: String,

    phone: String,

    address: String,

    medicalHistory: [
        {
            disease: String,
            diagnosisDate: Date,
            notes: String
        }
    ]

}, { timestamps: true });

export const PatientModel =
    model("patient", patientSchema);