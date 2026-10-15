
import { useEffect, useState } from "react";
import "./App.css";

function ViewJournal({ userId, onBack }) {
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedJournal, setSelectedJournal] = useState(null);

    useEffect(() => {
        const fetchJournals = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `http://localhost:5000/journals/${userId}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Could not load your journals."
                    );
                }

                // Supports both response formats:
                // [ { id, title, content, ... } ]
                // { journals: [ { id, title, content, ... } ] }
                const journalList = Array.isArray(data)
                    ? data
                    : Array.isArray(data.journals)
                    ? data.journals
                    : [];

                setJournals(journalList);
            } catch (err) {
                console.error("Journal loading error:", err);

                setError(
                    "Couldn't load your journals. Please check that the backend is running."
                );
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchJournals();
        } else {
            setJournals([]);
            setError("Please log in to view your journals.");
            setLoading(false);
        }
    }, [userId]);

    const formatDate = (value) => {
        if (!value) return "";

        const parsedDate = new Date(value);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Cute decorations for the journal pages
    const JournalDecorations = () => (
        <div className="journal-side-decorations view-journal-decorations">
            <span className="side-doodle doodle-bunny">🐰</span>
            <span className="side-doodle doodle-heart">💗</span>
            <span className="side-doodle doodle-cloud">☁️</span>
            <span className="side-doodle doodle-flower">🌷</span>
            <span className="side-doodle doodle-star">✨</span>
            <span className="side-doodle doodle-bear">🧸</span>
            <span className="side-doodle doodle-butterfly">🦋</span>
            <span className="side-doodle doodle-sparkle">✧ ˚</span>
        </div>
    );

    // Individual journal reading page
    if (selectedJournal) {
        return (
            <div className="journal-page">
                <div className="journal-topbar">
                    <button
                        className="journal-back-btn"
                        onClick={() => setSelectedJournal(null)}
                    >
                        ← All journals
                    </button>

                    <span className="journal-brand">Everly ♡</span>

                    <span className="journal-top-note">
                        your little memories
                    </span>
                </div>

                <JournalDecorations />

                <main className="journal-container view-journal-container">
                    <div className="journal-heading">
                        <span className="journal-sparkle">✧ ˚</span>

                        <h1>{selectedJournal.title}</h1>

                        <p>
                            {formatDate(selectedJournal.date)} ·{" "}
                            {selectedJournal.mood || "A moment of life"}
                        </p>
                    </div>

                    <article className="journal-paper journal-read-paper">
                        <div className="journal-read-content">
                            {selectedJournal.content}
                        </div>

                        <div className="journal-paper-footer">
                            <span>kept safe in Everly ♡</span>

                            <button
                                className="journal-save-btn"
                                onClick={() => setSelectedJournal(null)}
                            >
                                ← All journals
                            </button>
                        </div>
                    </article>

                    <p className="journal-bottom-note">
                        Every little thought matters ♡
                    </p>
                </main>
            </div>
        );
    }

    // All journals page
    return (
        <div className="journal-page">
            <div className="journal-topbar">
                <button
                    className="journal-back-btn"
                    onClick={onBack}
                >
                    ← Back
                </button>

                <span className="journal-brand">Everly ♡</span>

                <span className="journal-top-note">
                    your little memories
                </span>
            </div>

            <JournalDecorations />

            <main className="journal-container view-journal-container">
                <div className="journal-heading">
                    <span className="journal-sparkle">✧ ˚</span>

                    <h1>Pages of You</h1>

                    <p>
                        Every page holds a little piece of your story.
                    </p>
                </div>

                {loading && (
                    <p className="journal-status">
                        Gathering your little memories... ♡
                    </p>
                )}

                {error && (
                    <p className="journal-error journal-status">
                        {error}
                    </p>
                )}

                {!loading && !error && journals.length === 0 && (
                    <div className="journal-empty-state">
                        <span className="journal-empty-icon">📖</span>

                        <h2>Your story starts here</h2>

                        <p>
                            Your first journal page is waiting to be written.
                        </p>
                    </div>
                )}

                {!loading && !error && journals.length > 0 && (
                    <div className="journal-cards-grid">
                        {journals.map((journal) => (
                            <button
                                type="button"
                                className="journal-entry-card"
                                key={journal.id}
                                onClick={() => setSelectedJournal(journal)}
                            >
                                <div className="journal-card-top">
                                    <span className="journal-card-flower">
                                        ✿
                                    </span>

                                    <span className="journal-card-mood">
                                        {journal.mood || "My thoughts"}
                                    </span>
                                </div>

                                <h2>{journal.title}</h2>

                                <p className="journal-card-date">
                                    {formatDate(journal.date)}
                                </p>

                                <p className="journal-card-preview">
                                    {journal.content}
                                </p>

                                <span className="journal-card-open">
                                    Read this page →
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                <p className="journal-bottom-note">
                    Little moments, lovingly remembered ✿
                </p>
            </main>
        </div>
    );
}

export default ViewJournal;
