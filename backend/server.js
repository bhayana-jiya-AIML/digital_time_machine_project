const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Serve uploaded images
const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
}

app.use("/uploads", express.static(uploadsPath));


// --------------------
// MULTER CONFIGURATION
// --------------------

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsPath);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed."));
        }
    }
});


// Home route
app.get("/", (req, res) => {
    res.send("Digital Time Machine Backend is running!");
});


// Test database connection
app.get("/test-db", async (req, res) => {
    try {
        const users = await prisma.user.findMany();

        res.json({
            message: "Database connected successfully!",
            users: users
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});


// --------------------
// REGISTER
// --------------------

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword
            }
        });

        res.json({
            message: "User registered successfully!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});


// --------------------
// LOGIN
// --------------------

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.json({
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});


// --------------------
// CREATE MEMORY + IMAGE
// --------------------

app.post("/memories", upload.single("image"), async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            location,
            tags,
            userId
        } = req.body;

        if (!title || !description || !date || !userId) {
            return res.status(400).json({
                message: "Title, description, date and userId are required."
            });
        }

        const imageUrl = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        const memory = await prisma.memory.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                date: new Date(date),
                location: location ? location.trim() : null,
                tags: tags ? tags.trim() : null,
                imageUrl: imageUrl,
                userId: Number(userId)
            }
        });

        res.status(201).json({
            message: "Memory created successfully!",
            memory: memory
        });

    } catch (error) {
        console.error("Memory creation error:", error);

        res.status(500).json({
            message: "Memory creation failed",
            error: error.message
        });
    }
});


// --------------------
// GET MEMORIES
// --------------------

app.get("/memories/:userId", async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        const memories = await prisma.memory.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                date: "desc"
            }
        });

        res.json({
            message: "Memories retrieved successfully!",
            memories: memories
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve memories"
        });
    }
});


// --------------------
// START SERVER
// --------------------

app.listen(5000, () => {
    console.log("Server running on port 5000");
});