const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

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

// Register user
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

// Login user
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

// Create memory
app.post("/memories", async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            location,
            tags,
            userId
        } = req.body;

        const memory = await prisma.memory.create({
            data: {
                title: title,
                description: description,
                date: new Date(date),
                location: location,
                tags: tags,
                userId: userId
            }
        });

        res.json({
            message: "Memory created successfully!",
            memory: memory
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Memory creation failed"
        });
    }
});

// Get memories of a user
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

// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});