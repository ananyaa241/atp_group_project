import { Schema, model } from "mongoose";

const doctorSchema = new Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    specialization: {
        type: String,
        required: true
    },

    experience: {
        type: Number,
        default: 0
    },

    qualification: {
        type: String,
        default: ""
    },

    consultationFee: {
        type: Number,
        default: 0
    },

    profileImage: {
        type: String,
        default: ""
    },

    availability: [
        {
            day: String,
            startTime: String,
            endTime: String
        }
    ]

}, { timestamps: true });

export const DoctorModel =
    model("doctor", doctorSchema);