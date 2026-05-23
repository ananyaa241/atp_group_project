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

appointmentApp.post(
    "/symptom-check",
    VerifyToken,
    async (req, res, next) => {

        try {

            if (req.user.role !== "patient") {
                return res.status(403).json({
                    message: "Only patients may use the symptom checker."
                });
            }

            const symptoms = (req.body.symptoms || "").trim();

            if (!symptoms) {
                return res.status(400).json({
                    message: "Please provide symptoms for analysis."
                });
            }

            const patient = await PatientModel.findById(req.user.userId);

            if (!patient) {
                return res.status(404).json({
                    message: "Patient not found."
                });
            }

            const doctors = await DoctorModel.find();
            const availableSpecializations = [...new Set(
                doctors
                    .map((doc) => doc.specialization)
                    .filter(Boolean)
            )];

            let parsed = null;

            if (process.env.OPENAI_API_KEY) {
                const openAiResponse = await fetch(
                    "https://api.openai.com/v1/chat/completions",
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            model: "gpt-3.5-turbo",
                            messages: [
                                {
                                    role: "system",
                                    content: "You are a helpful, concise medical assistant."
                                },
                                {
                                    role: "user",
                                    content: prompt
                                }
                            ],
                            temperature: 0.25,
                            max_tokens: 320
                        })
                    }
                );

                const openAiData = await openAiResponse.json();

                if (openAiResponse.ok) {
                    const rawContent = openAiData?.choices?.[0]?.message?.content || "";
                    parsed = extractJson(rawContent);
                } else {
                    console.error("OpenAI API error:", openAiData?.error?.message || "Unknown error");
                }
            }

            // Fallback if OpenAI fails or key is missing
            if (!parsed) {
                const s = symptoms.toLowerCase();
                if (s.includes('heart') || s.includes('chest') || s.includes('palpitations')) {
                    parsed = {
                        specialization: "Cardiology",
                        explanation: "Based on heart-related symptoms, a cardiologist is recommended.",
                        precautions: ["Avoid heavy exertion", "Maintain calm breathing", "Seek ER if pain intensifies"]
                    };
                } else if (s.includes('brain') || s.includes('headache') || s.includes('dizziness')) {
                    parsed = {
                        specialization: "Neurology",
                        explanation: "Headaches or dizziness may require a neurological evaluation.",
                        precautions: ["Rest in a dark room", "Stay hydrated", "Avoid bright screens"]
                    };
                } else if (s.includes('bone') || s.includes('joint') || s.includes('fracture') || s.includes('knee')) {
                    parsed = {
                        specialization: "Orthopedics",
                        explanation: "Joint or bone pain is typically managed by an orthopedic specialist.",
                        precautions: ["Rest the affected area", "Use ice packs", "Avoid weight-bearing"]
                    };
                } else if (s.includes('skin') || s.includes('rash') || s.includes('itch')) {
                    parsed = {
                        specialization: "Dermatology",
                        explanation: "Skin conditions or rashes should be seen by a dermatologist.",
                        precautions: ["Avoid scratching", "Use mild soap", "Apply cool compress"]
                    };
                } else {
                    parsed = {
                        specialization: "General Medicine",
                        explanation: "For general symptoms, starting with a General Physician is best.",
                        precautions: ["Rest and fluids", "Monitor temperature", "Consult a doctor for diagnosis"]
                    };
                }
            }

            const matchedSpecialization = parsed.specialization || "General Medicine";

            let recommendedDoctors = doctors.filter((doc) =>
                doc.specialization?.toLowerCase().includes(matchedSpecialization.toLowerCase())
            );

            if (!recommendedDoctors.length) {
                recommendedDoctors = doctors.slice().sort((a, b) => (b.experience || 0) - (a.experience || 0));
            }

            recommendedDoctors = recommendedDoctors.slice(0, 4).map((doc) => ({
                _id: doc._id,
                name: doc.name,
                specialization: doc.specialization,
                experience: doc.experience,
                qualification: doc.qualification,
                consultationFee: doc.consultationFee,
                profileImage: doc.profileImage || "",
            }));

            res.status(200).json({
                payload: {
                    symptoms,
                    specialization: matchedSpecialization,
                    explanation: parsed.explanation || "A specialist from the recommended field can provide the best care.",
                    precautions: Array.isArray(parsed.precautions)
                        ? parsed.precautions
                        : [parsed.precautions],
                    recommendedDoctors
                }
            });

        } catch (err) {
            next(err);
        }
    }
);
