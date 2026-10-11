const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// SAVE MEMORY
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      tags,
      userId
    } = req.body;

    // Basic validation
    if (!title || !description || !date || !userId) {
      return res.status(400).json({
        success: false,
        message: "Title, description, date and userId are required."
      });
    }

    const memory = await prisma.memory.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        date: new Date(date),
        location: location ? location.trim() : null,
        tags: tags ? tags.trim() : null,
        userId: Number(userId)
      }
    });

    res.status(201).json({
      success: true,
      message: "Memory saved successfully!",
      memory
    });

  } catch (error) {
    console.error("Error saving memory:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save memory.",
      error: error.message
    });
  }
});

module.exports = router;