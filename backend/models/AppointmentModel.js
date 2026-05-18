import { Schema, model } from "mongoose";

const appointmentSchema = new Schema({

    patientId: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },

    doctorId: {
        type: Schema.Types.ObjectId,
        ref: "doctor"
    },

    appointmentDate: {
        type: Date,
        required: true
    },

    symptoms: String,

    status: {
        type: String,
        enum: ["Pending", "Approved", "Completed", "Cancelled"],
        default: "Pending"
    },

    prescriptionId: {
        type: Schema.Types.ObjectId,
        ref: "prescription"
    },

    // Tracks whether the 24-hour reminder email has been sent
    reminderSent: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

export const AppointmentModel = model("appointment", appointmentSchema);