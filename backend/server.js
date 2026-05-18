import exp from "express";
import { config } from "dotenv";
import { connect } from "mongoose";

import cookieParser from "cookie-parser";
import cors from "cors";

// ================= IMPORT API FILES =================

import { adminApp }
from "./APIs/AdminAPI.js";

import { doctorApp }
from "./APIs/DoctorAPI.js";

import { patientApp }
from "./APIs/PatientAPI.js";

import { appointmentApp }
from "./APIs/AppointmentAPI.js";

import { prescriptionApp }
from "./APIs/PrescriptionAPI.js";

import { commonApp }
from "./APIs/CommonAPI.js";

import { vitalsApp }
from "./APIs/VitalsAPI.js";

import { startReminderScheduler }
from "./services/reminderService.js";

config();


// ================= CREATE EXPRESS APP =================

const app = exp();


// ================= ENABLE CORS =================

const normalizeOrigin = (origin = '') => origin.trim().replace(/\/$/, '')
const parseOrigins = (value) =>
    !value ? [] : value.split(",").map(o => normalizeOrigin(o)).filter(Boolean)

const allowedOrigins = [
    normalizeOrigin("http://localhost:5173"),
    normalizeOrigin("http://localhost:5174"),
    normalizeOrigin("http://localhost:5175"),
    ...parseOrigins(process.env.ALLOWED_ORIGINS),
    ...parseOrigins(process.env.CLIENT_URL),
    ...parseOrigins(process.env.FRONTEND_URL)
].filter(Boolean)

const allowAllOrigins = process.env.ALLOW_ALL_ORIGINS === "true"

console.log("Allowed CORS origins:", allowAllOrigins ? "*" : allowedOrigins)

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true)
            }

            const normalizedOrigin = normalizeOrigin(origin)
            if (allowAllOrigins || allowedOrigins.includes(normalizedOrigin)) {
                return callback(null, true)
            }

            return callback(
                new Error(`Origin ${origin} not allowed by CORS`),
                false
            )
        },
        credentials: true
    })
)


// ================= COOKIE PARSER =================

app.use(cookieParser());


// ================= BODY PARSER =================

app.use(exp.json());


// ================= PATH LEVEL MIDDLEWARES =================

app.use(
    "/admin-api",
    adminApp
);

app.use(
    "/doctor-api",
    doctorApp
);

app.use(
    "/patient-api",
    patientApp
);

app.use(
    "/appointment-api",
    appointmentApp
);

app.use(
    "/prescription-api",
    prescriptionApp
);

app.use(
    "/auth",
    commonApp
);

app.use(
    "/vitals-api",
    vitalsApp
);


// ================= DATABASE CONNECTION =================

const connectDB = async () => {

    try {

        await connect(process.env.DB_URL);

        console.log(
            "MongoDB connected successfully"
        );

        //server port
        const port =
            process.env.PORT || 5000;

        app.listen(
            port,
            () => {

                console.log(
                    `Server running on port ${port}`
                );

            }
        );

    } catch (err) {

        console.log(
            "Database connection error",
            err
        );

    }

};

connectDB();

// ─── Start appointment reminder email scheduler ───────────────────────────────
startReminderScheduler();


// Health check for platform probes (Render, Vercel previews, etc.)
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Backend service is running' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// ================= INVALID PATH HANDLER =================

app.use((req, res, next) => {

    console.log(
        `Invalid path: ${req.url}`
    );

    res.status(404).json({

        message:
        `Path ${req.url} is invalid`

    });

});


// ================= GLOBAL ERROR HANDLER =================

app.use((err, req, res, next) => {

    console.log("FULL ERROR => ", err);

    //mongoose validation error
    if (err.name === "ValidationError") {

        return res.status(400).json({

            message:
            "Validation Error",

            error:
            err.message

        });

    }

    //mongoose invalid object id
    if (err.name === "CastError") {

        return res.status(400).json({

            message:
            "Invalid ID",

            error:
            err.message

        });

    }

    //duplicate key error
    const errCode =
        err.code ??
        err.cause?.code ??
        err.errorResponse?.code;

    const keyValue =
        err.keyValue ??
        err.cause?.keyValue ??
        err.errorResponse?.keyValue;

    if (errCode === 11000) {

        const field =
            Object.keys(keyValue)[0];

        const value =
            keyValue[field];

        return res.status(409).json({

            message:
            `${field} "${value}" already exists`

        });

    }

    //jwt errors
    if (err.name === "JsonWebTokenError") {

        return res.status(401).json({

            message:
            "Invalid token"

        });

    }

    if (err.name === "TokenExpiredError") {

        return res.status(401).json({

            message:
            "Token expired"

        });

    }

    //default server error
    res.status(500).json({

        message:
        "Server side error",

        error:
        err.message

    });

});
