import exp from "express";

import { AppointmentModel }
    from "../models/AppointmentModel.js";

import { DoctorModel }
    from "../models/DoctorModel.js";

import { PatientModel }
    from "../models/PatientModel.js";

import { transporter }
    from "../config/nodemailer.js";

import { VerifyToken }
    from "../middlewares/VerifyToken.js";

export const appointmentApp = exp.Router();



// ================= BOOK APPOINTMENT =================

appointmentApp.post(
    "/book",
    VerifyToken,
    async (req, res, next) => {

        try {

            const {
                patientId,
                doctorId,
                appointmentDate,
                symptoms
            } = req.body;

            //check patient
            const patient =
                await PatientModel.findById(
                    patientId
                );

            if (!patient) {

                return res.status(404).json({
                    message: "Patient not found"
                });

            }

            //check doctor
            const doctor =
                await DoctorModel.findById(
                    doctorId
                );

            if (!doctor) {

                return res.status(404).json({
                    message: "Doctor not found"
                });

            }

            //create appointment
            const newAppointment =
                await AppointmentModel.create({

                    patientId,
                    doctorId,
                    appointmentDate,
                    symptoms

                });

            //send email notification - asynchronous to avoid blocking response
            transporter.sendMail({

                from: process.env.EMAIL_USER,

                to: patient.email,

                subject:
                    "Appointment Confirmation",

                html: `

                    <h2>
                    Appointment Booked Successfully
                    </h2>

                    <p>
                    Dear ${patient.name},
                    </p>

                    <p>
                    Your appointment with
                    Dr. ${doctor.name}
                    has been booked.
                    </p>

                    <p>
                    <b>Date:</b>
                    ${appointmentDate}
                    </p>

                    <p>
                    Thank You
                    </p>

                    `
            }).catch(mailErr => {

                console.log(
                    "Email sending failed",
                    mailErr.message
                );

            });

            res.status(201).json({

                message:
                    "Appointment booked successfully",

                payload: newAppointment

            });

        } catch (err) {

            next(err);

        }

    }
);



// ================= GET ALL APPOINTMENTS =================

appointmentApp.get(
    "/",
    VerifyToken,
    async (req, res, next) => {

        try {

            const appointments =
                await AppointmentModel.find()

                    .populate(
                        "patientId"
                    )

                    .populate(
                        "doctorId"
                    )

                    .populate(
                        "prescriptionId"
                    )

                    .sort({
                        appointmentDate: 1
                    });

            res.status(200).json({

                message:
                    "Appointments fetched",

                payload: appointments

            });

        } catch (err) {

            next(err);

        }

    }
);



// ================= GET APPOINTMENT BY ID =================

appointmentApp.get(
    "/:id",
    VerifyToken,
    async (req, res, next) => {

        try {

            const appointment =
                await AppointmentModel.findById(
                    req.params.id
                )

                    .populate(
                        "patientId"
                    )

                    .populate(
                        "doctorId"
                    )

                    .populate(
                        "prescriptionId"
                    );

            if (!appointment) {

                return res.status(404).json({

                    message:
                        "Appointment not found"

                });

            }

            res.status(200).json({

                payload: appointment

            });

        } catch (err) {

            next(err);

        }

    }
);



// ================= UPDATE APPOINTMENT STATUS =================

appointmentApp.put(
    "/update-status/:id",
    VerifyToken,
    async (req, res, next) => {

        try {

            const updatedAppointment =
                await AppointmentModel.findByIdAndUpdate(

                    req.params.id,

                    req.body,

                    {
                        new: true
                    }

                );

            if (!updatedAppointment) {

                return res.status(404).json({

                    message:
                        "Appointment not found"

                });

            }

            res.status(200).json({

                message:
                    "Appointment updated successfully",

                payload: updatedAppointment

            });

        } catch (err) {

            next(err);

        }

    }
);



// ================= DELETE APPOINTMENT =================

appointmentApp.delete(
    "/delete/:id",
    VerifyToken,
    async (req, res, next) => {

        try {

            const deletedAppointment =
                await AppointmentModel.findByIdAndDelete(
                    req.params.id
                );

            if (!deletedAppointment) {

                return res.status(404).json({

                    message:
                        "Appointment not found"

                });

            }

            res.status(200).json({

                message:
                    "Appointment deleted successfully"

            });

        } catch (err) {

            next(err);

        }

    }
);



// ================= SEARCH APPOINTMENTS =================

appointmentApp.get(
    "/search/:status",
    VerifyToken,
    async (req, res, next) => {

        try {

            const appointments =
                await AppointmentModel.find({

                    status: req.params.status

                })

                    .populate(
                        "patientId"
                    )

                    .populate(
                        "doctorId"
                    );

            res.status(200).json({

                payload: appointments

            });

        } catch (err) {

            next(err);

        }

    }
);



// ================= DOCTOR APPOINTMENTS =================

appointmentApp.get(
    "/doctor/:doctorId",
    VerifyToken,
    async (req, res, next) => {

        try {

            const appointments =
                await AppointmentModel.find({

                    doctorId:
                        req.params.doctorId

                })

                    .populate(
                        "patientId"
                    )

                    .sort({
                        appointmentDate: 1
                    });

            res.status(200).json({

                payload: appointments

            });

        } catch (err) {

            next(err);

        }

    }
);



// ================= PATIENT APPOINTMENTS =================

appointmentApp.get(
    "/patient/:patientId",
    VerifyToken,
    async (req, res, next) => {

        try {

            const appointments =
                await AppointmentModel.find({

                    patientId:
                        req.params.patientId

                })

                    .populate(
                        "doctorId"
                    )

                    .sort({
                        appointmentDate: 1
                    });

            res.status(200).json({

                payload: appointments

            });

        } catch (err) {

            next(err);

        }

    }
);



// ================= CALENDAR EVENTS =================

appointmentApp.get(
    "/calendar/events",
    VerifyToken,
    async (req, res, next) => {

        try {

            const appointments =
                await AppointmentModel.find()

                    .populate("doctorId")
                    .populate("patientId");

            const events =
                appointments.map((appt) => ({

                    title:
                        `${appt.patientId.name}
                    with
                    Dr.${appt.doctorId.name}`,

                    start:
                        appt.appointmentDate,

                    status:
                        appt.status

                }));

            res.status(200).json({

                payload: events

            });

        } catch (err) {

            next(err);

        }

    }
);

