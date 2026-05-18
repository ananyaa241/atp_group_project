import exp from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import { AdminModel } from "../models/AdminModel.js";
import { DoctorModel } from "../models/DoctorModel.js";
import { PatientModel } from "../models/PatientModel.js";

export const commonApp = exp.Router();


//login
commonApp.post("/login", async (req, res, next) => {

    try {

        const { email, password } = req.body;

        //admin
        let user = await AdminModel.findOne({ email });

        let role = "admin";

        //doctor
        if (!user) {

            user = await DoctorModel.findOne({ email });

            role = "doctor";
        }

        //patient
        if (!user) {

            user = await PatientModel.findOne({ email });

            role = "patient";
        }

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const status = await bcryptjs.compare(
            password,
            user.password
        );

        if (!status) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login success",
            token,
            role,
            user
        });

    } catch (err) {
        next(err);
    }

});


//verify token
commonApp.get("/verify", (req, res) => {

    res.status(200).json({
        message: "Authorized"
    });

});