import exp from "express";
import bcryptjs from "bcryptjs";

import { AdminModel } from "../models/AdminModel.js";
import { DoctorModel } from "../models/DoctorModel.js";
import { PatientModel } from "../models/PatientModel.js";
import { AppointmentModel } from "../models/AppointmentModel.js";

export const adminApp = exp.Router();


//register admin
adminApp.post("/register", async (req, res, next) => {

    try {

        const adminData = req.body;

        const admin = await AdminModel.findOne({
            email: adminData.email
        });

        if (admin) {
            return res.status(409).json({
                message: "Admin already exists"
            });
        }

        const hashedPassword = await bcryptjs.hash(
            adminData.password,
            6
        );

        adminData.password = hashedPassword;

        await AdminModel.create(adminData);

        res.status(201).json({
            message: "Admin created"
        });

    } catch (err) {
        next(err);
    }

});


//dashboard
adminApp.get("/dashboard", async (req, res, next) => {

    try {

        const doctorsCount = await DoctorModel.countDocuments();

        const patientsCount = await PatientModel.countDocuments();

        const appointmentsCount =
            await AppointmentModel.countDocuments();

        res.status(200).json({
            doctorsCount,
            patientsCount,
            appointmentsCount
        });

    } catch (err) {
        next(err);
    }

});