
require("dotenv").config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// UPLOADS DIRECTORY
// --------------------------------------------------

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

// --------------------------------------------------
// MULTER CONFIGURATION
// Supports one legacy image field and multiple images/videos
// --------------------------------------------------

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName =
            Date.now() +
            "-" +
            crypto.randomBytes(6).toString("hex") +
            ext;

        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,

    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 20,
    },

    fileFilter: (req, file, cb) => {
        const isImage = file.mimetype.startsWith("image/");
        const isVideo = file.mimetype.startsWith("video/");

        if (
            file.fieldname === "image" ||
            file.fieldname === "images"
        ) {
            return isImage
                ? cb(null, true)
                : cb(new Error("Please upload valid image files."));
        }

        if (file.fieldname === "videos") {
            return isVideo
                ? cb(null, true)
                : cb(new Error("Please upload valid video files."));
        }

        return cb(new Error("Unexpected file field."));
    },
});

const memoryUpload = upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 15 },
    { name: "videos", maxCount: 5 },
]);

function getUploadedFiles(req) {
    return [
        ...(req.files?.image || []),
        ...(req.files?.images || []),
        ...(req.files?.videos || []),
    ];
}

function getMediaType(file) {
    return file.mimetype.startsWith("video/") ? "video" : "image";
}

function getMediaUrl(file) {
    return `/uploads/${file.filename}`;
}

function safeDeleteUploadedFiles(files = []) {
    for (const file of files) {
        if (!file?.path) continue;

        const resolvedPath = path.resolve(file.path);

        if (path.dirname(resolvedPath) !== path.resolve(uploadsDir)) {
            continue;
        }

        try {
            if (fs.existsSync(resolvedPath)) {
                fs.unlinkSync(resolvedPath);
            }
        } catch (error) {
            console.error("File cleanup error:", error.message);
        }
    }
}

function safeDeleteMediaUrls(urls = []) {
    for (const url of urls) {
        if (typeof url !== "string") continue;

        const filename = path.basename(url);
        const resolvedPath = path.resolve(uploadsDir, filename);

        if (path.dirname(resolvedPath) !== path.resolve(uploadsDir)) {
            continue;
        }

        try {
            if (fs.existsSync(resolvedPath)) {
                fs.unlinkSync(resolvedPath);
            }
        } catch (error) {
            console.error("Media deletion error:", error.message);
        }
    }
}

// --------------------------------------------------
// TEXT ENCRYPTION
// Keep JOURNAL_ENCRYPTION_KEY in backend/.env.
// Do not change or lose the existing key.
// --------------------------------------------------

function getEncryptionKey() {
    const key = process.env.JOURNAL_ENCRYPTION_KEY;

    if (!key || !/^[0-9a-fA-F]{64}$/.test(key)) {
        throw new Error(
            "JOURNAL_ENCRYPTION_KEY must contain exactly 64 hexadecimal characters."
        );
    }

    return Buffer.from(key, "hex");
}

function encryptText(value, prefix) {
    if (value == null) return value;

    const text = String(value);

    if (text.startsWith(`${prefix}:`)) {
        return text;
    }

    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        getEncryptionKey(),
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(text, "utf8"),
        cipher.final(),
    ]);

    return [
        prefix,
        iv.toString("hex"),
        cipher.getAuthTag().toString("hex"),
        encrypted.toString("hex"),
    ].join(":");
}

function decryptText(value, prefix) {
    if (value == null) return value;

    if (
        typeof value !== "string" ||
        !value.startsWith(`${prefix}:`)
    ) {
        return value;
    }

    const parts = value.split(":");

    if (
        parts.length !== 5 ||
        parts[0] !== prefix.split(":")[0] ||
        parts[1] !== prefix.split(":")[1]
    ) {
        throw new Error("Invalid encrypted text format.");
    }

    const iv = Buffer.from(parts[2], "hex");
    const tag = Buffer.from(parts[3], "hex");
    const encrypted = Buffer.from(parts[4], "hex");

    if (iv.length !== 12 || tag.length !== 16) {
        throw new Error("Invalid encrypted text data.");
    }

    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        getEncryptionKey(),
        iv
    );

    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}

// --------------------------------------------------
// JOURNAL ENCRYPTION HELPERS
// --------------------------------------------------

function encryptJournalData(data) {
    return {
        ...data,
        title: encryptText(data.title, "enc:v1"),
        content: encryptText(data.content, "enc:v1"),
        mood:
            data.mood == null
                ? data.mood
                : encryptText(data.mood, "enc:v1"),
    };
}

function decryptJournal(journal) {
    if (!journal) return journal;

    return {
        ...journal,
        title: decryptText(journal.title, "enc:v1"),
        content: decryptText(journal.content, "enc:v1"),
        mood:
            journal.mood == null
                ? journal.mood
                : decryptText(journal.mood, "enc:v1"),
    };
}

async function encryptExistingJournals() {
    const journals = await prisma.journal.findMany();

    for (const journal of journals) {
        const updates = {};

        if (!journal.title.startsWith("enc:v1:")) {
            updates.title = encryptText(journal.title, "enc:v1");
        }

        if (!journal.content.startsWith("enc:v1:")) {
            updates.content = encryptText(journal.content, "enc:v1");
        }

        if (
            journal.mood != null &&
            !journal.mood.startsWith("enc:v1:")
        ) {
            updates.mood = encryptText(journal.mood, "enc:v1");
        }

        if (Object.keys(updates).length > 0) {
            await prisma.journal.update({
                where: { id: journal.id },
                data: updates,
            });
        }
    }

    console.log("Journal encryption check completed.");
}

// --------------------------------------------------
// MEMORY ENCRYPTION HELPERS
// --------------------------------------------------

function encryptMemoryData(data) {
    const result = { ...data };

    for (const field of [
        "title",
        "description",
        "location",
        "tags",
    ]) {
        if (result[field] != null) {
            result[field] = encryptText(result[field], "mem:v1");
        }
    }

    return result;
}

function decryptMemory(memory) {
    if (!memory) return memory;

    const result = { ...memory };

    for (const field of [
        "title",
        "description",
        "location",
        "tags",
    ]) {
        if (result[field] != null) {
            result[field] = decryptText(result[field], "mem:v1");
        }
    }

    return result;
}

function decryptMemoryWithMedia(memory) {
    const readable = decryptMemory(memory);

    const media = (memory.media || []).map((item) => ({
        id: item.id,
        url: item.url,
        type: item.type,
        createdAt: item.createdAt,
    }));

    // Support memories saved before multiple-media functionality.
    if (
        memory.imageUrl &&
        !media.some((item) => item.url === memory.imageUrl)
    ) {
        media.unshift({
            id: `legacy-${memory.id}`,
            url: memory.imageUrl,
            type: "image",
            createdAt: memory.createdAt,
        });
    }

    return {
        ...readable,
        media,
        images: media.filter((item) => item.type === "image"),
        videos: media.filter((item) => item.type === "video"),
    };
}

async function encryptExistingMemories() {
    const memories = await prisma.memory.findMany();

    for (const memory of memories) {
        const updates = {};

        for (const field of [
            "title",
            "description",
            "location",
            "tags",
        ]) {
            if (
                memory[field] != null &&
                !memory[field].startsWith("mem:v1:")
            ) {
                updates[field] = encryptText(
                    memory[field],
                    "mem:v1"
                );
            }
        }

        if (Object.keys(updates).length > 0) {
            await prisma.memory.update({
                where: { id: memory.id },
                data: updates,
            });
        }
    }

    console.log("Memory encryption check completed.");
}

// --------------------------------------------------
// BASIC ROUTES
// --------------------------------------------------

app.get("/", (req, res) => {
    res.send("Everly backend is running!");
});

app.get("/test-db", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            message: "Database connected successfully!",
        });
    } catch (error) {
        console.error("Database test error:", error);
        res.status(500).json({
            message: "Database connection failed.",
        });
    }
});

// --------------------------------------------------
// REGISTER
// --------------------------------------------------

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required.",
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({
            message: "Registration successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Registration failed.",
        });
    }
});

// --------------------------------------------------
// LOGIN
// --------------------------------------------------

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required.",
            });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        res.json({
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed.",
        });
    }
});

// --------------------------------------------------
// ADD MEMORY WITH MULTIPLE IMAGES AND VIDEOS
// --------------------------------------------------

app.post("/memories", memoryUpload, async (req, res) => {
    const uploadedFiles = getUploadedFiles(req);

    try {
        const {
            title,
            description,
            date,
            location,
            tags,
            userId,
        } = req.body;

        const parsedUserId = Number(userId);

        if (
            !title?.trim() ||
            !description?.trim() ||
            !date ||
            !Number.isInteger(parsedUserId) ||
            parsedUserId <= 0
        ) {
            safeDeleteUploadedFiles(uploadedFiles);

            return res.status(400).json({
                message:
                    "Title, description, date and a valid userId are required.",
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: parsedUserId },
        });

        if (!user) {
            safeDeleteUploadedFiles(uploadedFiles);

            return res.status(404).json({
                message: "User not found.",
            });
        }

        const files = uploadedFiles;
        const firstImage = files.find(
            (file) => getMediaType(file) === "image"
        );

        const memoryData = encryptMemoryData({
            title: title.trim(),
            description: description.trim(),
            date: new Date(date),
            location: location?.trim() || null,
            tags: tags?.trim() || null,
            userId: parsedUserId,
            imageUrl: firstImage ? getMediaUrl(firstImage) : null,
        });

        const memory = await prisma.memory.create({
            data: {
                ...memoryData,
                media: {
                    create: files.map((file) => ({
                        url: getMediaUrl(file),
                        type: getMediaType(file),
                    })),
                },
            },
            include: {
                media: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        res.status(201).json({
            message: "Memory saved successfully!",
            memory: decryptMemoryWithMedia(memory),
        });
    } catch (error) {
        safeDeleteUploadedFiles(uploadedFiles);

        console.error("Add memory error:", error);

        res.status(500).json({
            message: "Failed to save memory.",
        });
    }
});

// --------------------------------------------------
// GET MEMORIES — FIXED RESPONSE FORMAT
// Returns { message, memories: [...] }
// --------------------------------------------------

app.get("/memories/:userId", async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                message: "Invalid userId.",
                memories: [],
            });
        }

        const memories = await prisma.memory.findMany({
            where: { userId },
            include: {
                media: {
                    orderBy: { createdAt: "asc" },
                },
            },
            orderBy: { date: "desc" },
        });

        const readableMemories = memories.map(
            decryptMemoryWithMedia
        );

        return res.status(200).json({
            message: "Memories fetched successfully!",
            memories: readableMemories,
        });
    } catch (error) {
        console.error("Fetch memories error:", error);

        return res.status(500).json({
            message: "Failed to fetch memories.",
            memories: [],
        });
    }
});

// --------------------------------------------------
// EDIT MEMORY AND ADD/REMOVE MEDIA
// --------------------------------------------------

app.put("/memories/:id", memoryUpload, async (req, res) => {
    const uploadedFiles = getUploadedFiles(req);
    let oldUrlsToDelete = [];

    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            safeDeleteUploadedFiles(uploadedFiles);

            return res.status(400).json({
                message: "Invalid memory ID.",
            });
        }

        const existingMemory = await prisma.memory.findUnique({
            where: { id },
            include: { media: true },
        });

        if (!existingMemory) {
            safeDeleteUploadedFiles(uploadedFiles);

            return res.status(404).json({
                message: "Memory not found.",
            });
        }

        const data = {};

        if (req.body.title !== undefined) {
            if (!req.body.title.trim()) {
                safeDeleteUploadedFiles(uploadedFiles);

                return res.status(400).json({
                    message: "Title cannot be empty.",
                });
            }

            data.title = encryptText(
                req.body.title.trim(),
                "mem:v1"
            );
        }

        if (req.body.description !== undefined) {
            if (!req.body.description.trim()) {
                safeDeleteUploadedFiles(uploadedFiles);

                return res.status(400).json({
                    message: "Description cannot be empty.",
                });
            }

            data.description = encryptText(
                req.body.description.trim(),
                "mem:v1"
            );
        }

        if (req.body.date !== undefined) {
            const parsedDate = new Date(req.body.date);

            if (Number.isNaN(parsedDate.getTime())) {
                safeDeleteUploadedFiles(uploadedFiles);

                return res.status(400).json({
                    message: "Invalid memory date.",
                });
            }

            data.date = parsedDate;
        }

        for (const field of ["location", "tags"]) {
            if (req.body[field] !== undefined) {
                data[field] = req.body[field].trim()
                    ? encryptText(req.body[field].trim(), "mem:v1")
                    : null;
            }
        }

        let removeMediaIds = [];

        if (req.body.removeMediaIds !== undefined) {
            try {
                const parsed =
                    typeof req.body.removeMediaIds === "string"
                        ? JSON.parse(req.body.removeMediaIds)
                        : req.body.removeMediaIds;

                if (!Array.isArray(parsed)) {
                    throw new Error("removeMediaIds must be an array.");
                }

                removeMediaIds = parsed
                    .map(Number)
                    .filter(
                        (mediaId) =>
                            Number.isInteger(mediaId) && mediaId > 0
                    );
            } catch {
                safeDeleteUploadedFiles(uploadedFiles);

                return res.status(400).json({
                    message: "Invalid removeMediaIds format.",
                });
            }
        }

        const mediaBeingRemoved = existingMemory.media.filter(
            (item) => removeMediaIds.includes(item.id)
        );

        const remainingMedia = existingMemory.media.filter(
            (item) => !removeMediaIds.includes(item.id)
        );

        const newFiles = uploadedFiles;

        const remainingImage =
            remainingMedia.find((item) => item.type === "image");

        const newImage = newFiles.find(
            (file) => getMediaType(file) === "image"
        );

        // Keep imageUrl in sync with the first available image.
        if (newImage) {
            data.imageUrl = getMediaUrl(newImage);
        } else if (
            existingMemory.imageUrl &&
            mediaBeingRemoved.some(
                (item) => item.url === existingMemory.imageUrl
            )
        ) {
            data.imageUrl = remainingImage?.url || null;
        }

        const updatedMemory = await prisma.$transaction(async (tx) => {
            if (removeMediaIds.length > 0) {
                await tx.memoryMedia.deleteMany({
                    where: {
                        memoryId: id,
                        id: { in: removeMediaIds },
                    },
                });
            }

            if (newFiles.length > 0) {
                await tx.memoryMedia.createMany({
                    data: newFiles.map((file) => ({
                        memoryId: id,
                        url: getMediaUrl(file),
                        type: getMediaType(file),
                    })),
                });
            }

            await tx.memory.update({
                where: { id },
                data,
            });

            return tx.memory.findUnique({
                where: { id },
                include: {
                    media: {
                        orderBy: { createdAt: "asc" },
                    },
                },
            });
        });

        oldUrlsToDelete = mediaBeingRemoved.map((item) => item.url);

        // Delete files only after the database changes succeed.
        safeDeleteMediaUrls(oldUrlsToDelete);

        res.json({
            message: "Memory updated successfully!",
            memory: decryptMemoryWithMedia(updatedMemory),
        });
    } catch (error) {
        safeDeleteUploadedFiles(uploadedFiles);

        console.error("Update memory error:", error);

        res.status(500).json({
            message: "Failed to update memory.",
        });
    }
});

// --------------------------------------------------
// ADD JOURNAL
// --------------------------------------------------

app.post("/journals", async (req, res) => {
    try {
        const { title, content, mood, userId, date } = req.body;
        const parsedUserId = Number(userId);

        if (
            !title?.trim() ||
            !content?.trim() ||
            !Number.isInteger(parsedUserId) ||
            parsedUserId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Title, content and a valid userId are required.",
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: parsedUserId },
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        const journalDate = date ? new Date(date) : new Date();

        if (Number.isNaN(journalDate.getTime())) {
            return res.status(400).json({
                message: "Invalid journal date.",
            });
        }

        const journal = await prisma.journal.create({
            data: {
                ...encryptJournalData({
                    title: title.trim(),
                    content: content.trim(),
                    mood: mood?.trim() || null,
                }),
                userId: parsedUserId,
                date: journalDate,
            },
        });

        res.status(201).json({
            message: "Journal saved successfully!",
            journal: decryptJournal(journal),
        });
    } catch (error) {
        console.error("Add journal error:", error);

        res.status(500).json({
            message: "Failed to save journal.",
        });
    }
});

// --------------------------------------------------
// GET JOURNALS
// --------------------------------------------------

app.get("/journals/:userId", async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                message: "Invalid userId.",
                journals: [],
            });
        }

        const journals = await prisma.journal.findMany({
            where: { userId },
            orderBy: { date: "desc" },
        });

        return res.status(200).json({
            message: "Journals fetched successfully!",
            journals: journals.map(decryptJournal),
        });
    } catch (error) {
        console.error("Fetch journals error:", error);

        return res.status(500).json({
            message: "Failed to fetch journals.",
            journals: [],
        });
    }
});

// --------------------------------------------------
// MULTER / REQUEST ERROR HANDLER
// --------------------------------------------------

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    console.error("Request error:", error.message);

    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            message: `File upload error: ${error.message}`,
        });
    }

    return res.status(400).json({
        message: error.message || "Request failed.",
    });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

async function startServer() {
    try {
        // Validate the existing key before connecting or decrypting data.
        getEncryptionKey();

        await prisma.$connect();

        await encryptExistingJournals();
        await encryptExistingMemories();

        app.listen(5000, () => {
            console.log("Server running on port 5000");
        });
    } catch (error) {
        console.error("Server startup failed:", error);

        await prisma.$disconnect().catch(() => {});
        process.exit(1);
    }
}

startServer();
