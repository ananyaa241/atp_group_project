import exp from "express";
import bcryptjs from "bcryptjs";

import { PatientModel } from "../models/PatientModel.js";
import { transporter } from "../config/nodemailer.js";

export const patientApp = exp.Router();


//register patient
patientApp.post("/register",
async (req, res, next) => {

    try {

        const patientData = req.body;

        const patient = await PatientModel.findOne({
            email: patientData.email
        });

        if (patient) {
            return res.status(409).json({
                message: "Patient already exists"
            });
        }

        const hashedPassword = await bcryptjs.hash(
            patientData.password,
            6
        );

        patientData.password = hashedPassword;

        await PatientModel.create(patientData);

        // Send registration confirmation email
        if (patientData.email) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: patientData.email,
                    subject: "Welcome to MediCare+",
                    html: `
                        <h2>Welcome to MediCare+</h2>
                        <p>Dear ${patientData.name},</p>
                        <p>Thank you for registering with MediCare+. Your account has been created successfully.</p>
                        <p>You can now log in to our portal to book appointments, view your prescriptions, and manage your healthcare seamlessly.</p>
                        <br/>
                        <p>Best Regards,</p>
                        <p><b>MediCare+ Hospital Team</b></p>
                    `
                });
            } catch (mailErr) {
                console.log("Registration email failed", mailErr.message);
            }
        }

        res.status(201).json({
            message: "Patient registered"
        });

    } catch (err) {
        next(err);
    }

});


//get all patients
patientApp.get("/patients",
async (req, res, next) => {

    try {

        const patients = await PatientModel.find();

        res.status(200).json({
            payload: patients
        });

    } catch (err) {
        next(err);
    }

});


//get patient
patientApp.get("/patient/:id",
async (req, res, next) => {

    try {

        const patient = await PatientModel.findById(
            req.params.id
        );

        res.status(200).json({
            payload: patient
        });

    } catch (err) {
        next(err);
    }

});


//update patient
patientApp.put("/update-patient/:id",
async (req, res, next) => {

    try {

        await PatientModel.findByIdAndUpdate(
            req.params.id,
            req.body
        );

        res.status(200).json({
            message: "Patient updated"
        });

    } catch (err) {
        next(err);
    }

});


//delete patient
patientApp.delete("/delete-patient/:id",
async (req, res, next) => {

    try {

        await PatientModel.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            message: "Patient deleted"
        });

    } catch (err) {
        next(err);
    }

});

//search patients
patientApp.get(
    "/search/:key",
    async (req, res, next) => {

        try {

            const patients =
                await PatientModel.find({

                    name: {
                        $regex: req.params.key,
                        $options: "i"
                    }

                });

            res.status(200).json({

                payload: patients

            });

        } catch (err) {

            next(err);

        }

    }
);