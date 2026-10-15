import { useState } from "react";
import "./App.css";

function AddJournal({ userId, onBack, onJournalAdded }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [mood, setMood] = useState("Happy");
    const [date, setDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async (e) => {
        e.preventDefault();
        setError("");

        if (!title.trim() || !content.trim()) {
            setError("Please add a title and write something in your journal 💗");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch("http://localhost:5000/journals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    mood,
                    date,
                    userId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not save your journal.");
            }

            alert("Your little memory has been saved 💗");
            onJournalAdded();
        } catch (err) {
            console.error("Journal save error:", err);
            setError(
                "Couldn't save your journal. Please check that the backend is running."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="journal-page">
            <div className="journal-topbar">
                <button className="journal-back-btn" onClick={onBack}>
                    ← Back
                </button>

                <span className="journal-brand">Everly ♡</span>

                <span className="journal-top-note">a little space for you</span>
            </div>

            <div className="journal-side-decorations">
    <span className="side-doodle doodle-bunny">🐰</span>
    <span className="side-doodle doodle-heart">💗</span>
    <span className="side-doodle doodle-cloud">☁️</span>
    <span className="side-doodle doodle-flower">🌷</span>
    <span className="side-doodle doodle-star">✨</span>
    <span className="side-doodle doodle-bear">🧸</span>
    <span className="side-doodle doodle-butterfly">🦋</span>
    <span className="side-doodle doodle-sparkle">✧ ˚</span>
</div>

            <main className="journal-container">
                <div className="journal-heading">
                    <span className="journal-sparkle">✧ ˚</span>
                    <h1>Dear Diary...</h1>
                    <p>
                        Take a deep breath. This little page is all yours.
                    </p>
                </div>

                <div className="journal-decorations">
                    <span>♡</span>
                    <span>✿</span>
                    <span>☁</span>
                </div>

                <form className="journal-paper" onSubmit={handleSave}>
                    <div className="journal-paper-date">
                        <label htmlFor="journal-date">Today is</label>
                        <input
                            id="journal-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <input
                        className="journal-title-input"
                        type="text"
                        placeholder="Give today's thoughts a title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={120}
                        required
                    />

                    <div className="journal-mood">
                        <label htmlFor="journal-mood">Today's mood</label>
                        <select
                            id="journal-mood"
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                        >
                            <option>Happy</option>
                            <option>Grateful</option>
                            <option>Calm</option>
                            <option>Excited</option>
                            <option>Thoughtful</option>
                            <option>Sad</option>
                            <option>Mixed feelings</option>
                        </select>
                    </div>

                    <textarea
                        className="journal-writing-area"
                        placeholder={"Dear diary,\n\nToday I want to remember..."}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />

                    {error && (
                        <p className="journal-error">{error}</p>
                    )}

                    <div className="journal-paper-footer">
                        <span>made with a little love ♡</span>

                        <button
                            type="submit"
                            className="journal-save-btn"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save my journal ♡"}
                        </button>
                    </div>
                </form>

                <p className="journal-bottom-note">
                    Your thoughts deserve a place to bloom ✿
                </p>
            </main>
        </div>
    );
}

export default AddJournal;