import React, { useEffect, useState } from "react";

function ViewMemory({ userId, onBack }) {
    const [memories, setMemories] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMemories = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/memories/${userId}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch memories"
                    );
                }

                setMemories(data.memories || []);
            } catch (error) {
                console.error("Error fetching memories:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchMemories();
        }
    }, [userId]);

    const years = [
        ...new Set(
            memories.map((memory) =>
                new Date(memory.date).getFullYear()
            )
        ),
    ].sort((a, b) => b - a);

    const filteredMemories = selectedYear
        ? memories.filter(
              (memory) =>
                  new Date(memory.date).getFullYear() ===
                  Number(selectedYear)
          )
        : [];

    if (loading) {
        return (
            <div className="view-memory-page">
                <div className="view-memory-loading">
                    <div className="loading-sparkle">✦</div>
                    <p>Gathering your memories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="view-memory-page">

            {/* BACKGROUND GLOWS */}
            <div className="view-glow view-glow-1"></div>
            <div className="view-glow view-glow-2"></div>
            <div className="view-glow view-glow-3"></div>

            {/* MOVING TEXT */}
            <div className="memory-floating-text floating-text-1">
                MEMORIES · MOMENTS · FOREVER · LITTLE THINGS ·
            </div>

            <div className="memory-floating-text floating-text-2">
                YESTERDAY · TODAY · ALWAYS · MEMORIES ·
            </div>

            <div className="memory-floating-text floating-text-3">
                LITTLE THINGS BECOME EVERYTHING ·
            </div>

            <div className="memory-floating-text floating-text-4">
                YOUR STORY · YOUR MOMENTS · YOUR UNIVERSE ·
            </div>

            {/* QUOTES */}
            <div className="memory-quote quote-left">
                “keep the little things.”
            </div>

            <div className="memory-quote quote-right">
                “this moment mattered.”
            </div>

            <div className="memory-quote quote-top">
                “made of moments ♡”
            </div>

            <div className="memory-quote quote-bottom">
                “somewhere in time, we smiled ♡”
            </div>

            {/* STARS */}
            <div className="memory-star star-1">✦</div>
            <div className="memory-star star-2">✧</div>
            <div className="memory-star star-3">✦</div>
            <div className="memory-star star-4">✧</div>
            <div className="memory-star star-5">✦</div>
            <div className="memory-star star-6">✧</div>
            <div className="memory-star star-7">✦</div>
            <div className="memory-star star-8">✧</div>

            {/* FLOATING DOODLES */}
            <div className="memory-doodle doodle-heart-1">♡</div>
            <div className="memory-doodle doodle-heart-2">♡</div>
            <div className="memory-doodle doodle-heart-3">♥</div>
            <div className="memory-doodle doodle-sparkle-1">✧</div>
            <div className="memory-doodle doodle-sparkle-2">✦</div>
            <div className="memory-doodle doodle-flower-1">❀</div>

            {/* NAVBAR */}
            <nav className="view-memory-navbar">

                <button
                    className="view-back-button"
                    onClick={onBack}
                >
                    ← <span>Back to Everly</span>
                </button>

                <div className="view-memory-logo">
                    Everly <span>✦</span>
                </div>

                <div className="view-memory-nav-text">
                    YOUR MEMORIES
                </div>

            </nav>

            {/* MAIN */}
            <main className="view-memory-main">

                {/* HEADER */}
                <div className="view-memory-header">

                    <div className="view-memory-eyebrow">
                        A LITTLE JOURNEY THROUGH TIME
                    </div>

                    <h1>
                        Your <i>Memories.</i>
                    </h1>

                    <p>
                        Revisit the little moments that made
                        <br />
                        your story yours.
                    </p>

                    <div className="view-memory-divider">
                        <span></span>
                        ✦
                        <span></span>
                    </div>

                </div>

                {/* NO MEMORIES */}
                {years.length === 0 ? (

                    <div className="empty-memories">

                        <div className="empty-icon">
                            ♡
                        </div>

                        <h2>
                            Nothing here yet.
                        </h2>

                        <p>
                            Your beautiful memories are waiting
                            <br />
                            to be added.
                        </p>

                    </div>

                ) : (

                    <>
                        {/* YEAR SELECTOR */}
                        <section className="year-section">

                            <div className="year-heading">
                                <span>01</span>
                                <h2>Choose a year</h2>
                            </div>

                            <div className="year-buttons">

                                {years.map((year) => (

                                    <button
                                        key={year}
                                        className={
                                            selectedYear === year
                                                ? "year-button active"
                                                : "year-button"
                                        }
                                        onClick={() => {
                                            setSelectedYear(year);
                                            setSelectedMemory(null);
                                        }}
                                    >
                                        {year}
                                    </button>

                                ))}

                            </div>

                        </section>

                        {/* MEMORIES */}
                        {selectedYear && (

                            <section className="memories-section">

                                <div className="memory-section-heading">

                                    <div>
                                        <span>
                                            02 · YOUR LITTLE MOMENTS
                                        </span>

                                        <h2>
                                            Memories from{" "}
                                            <i>{selectedYear}</i>
                                        </h2>
                                    </div>

                                    <p>
                                        {filteredMemories.length}{" "}
                                        {filteredMemories.length === 1
                                            ? "memory"
                                            : "memories"}
                                    </p>

                                </div>

                                {filteredMemories.length === 0 ? (

                                    <div className="empty-year">
                                        <span>♡</span>

                                        <p>
                                            No memories saved for this year yet.
                                        </p>
                                    </div>

                                ) : (

                                    <div className="memory-card-grid">

                                        {filteredMemories.map((memory) => (

                                            <button
                                                key={memory.id}
                                                className="memory-flashcard"
                                                onClick={() =>
                                                    setSelectedMemory(memory)
                                                }
                                            >

                                                <div className="memory-card-image">

                                                    {memory.imageUrl ? (

                                                        <img
                                                            src={`http://localhost:5000${memory.imageUrl}`}
                                                            alt={memory.title}
                                                        />

                                                    ) : (

                                                        <div className="memory-placeholder">
                                                            <span>✦</span>
                                                        </div>

                                                    )}

                                                    <div className="memory-card-overlay">
                                                        <span>
                                                            Open memory →
                                                        </span>
                                                    </div>

                                                </div>

                                                <div className="memory-card-content">

                                                    <span className="memory-card-date">
                                                        {new Date(
                                                            memory.date
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                day: "numeric",
                                                                month: "long",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                    </span>

                                                    <h3>
                                                        {memory.title}
                                                    </h3>

                                                    {memory.location && (
                                                        <p>
                                                            ♡ {memory.location}
                                                        </p>
                                                    )}

                                                </div>

                                            </button>

                                        ))}

                                    </div>

                                )}

                            </section>

                        )}
                    </>
                )}

            </main>

            {/* DETAIL MODAL */}
            {selectedMemory && (

                <div
                    className="memory-detail-overlay"
                    onClick={() => setSelectedMemory(null)}
                >

                    <div
                        className="memory-detail-card"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            className="memory-detail-close"
                            onClick={() => setSelectedMemory(null)}
                        >
                            ×
                        </button>

                        <div className="memory-detail-image">

                            {selectedMemory.imageUrl ? (

                                <img
                                    src={`http://localhost:5000${selectedMemory.imageUrl}`}
                                    alt={selectedMemory.title}
                                />

                            ) : (

                                <div className="memory-detail-placeholder">
                                    <span>✦</span>
                                    <p>
                                        A moment worth remembering
                                    </p>
                                </div>

                            )}

                        </div>

                        <div className="memory-detail-content">

                            <span className="detail-date">
                                {new Date(
                                    selectedMemory.date
                                ).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>

                            <h2>
                                {selectedMemory.title}
                            </h2>

                            {selectedMemory.location && (
                                <div className="detail-location">
                                    ♡ {selectedMemory.location}
                                </div>
                            )}

                            {selectedMemory.tags && (
                                <div className="detail-tags">

                                    {selectedMemory.tags
                                        .split(",")
                                        .map((tag, index) => (
                                            <span key={index}>
                                                #{tag.trim()}
                                            </span>
                                        ))}

                                </div>
                            )}

                            <div className="detail-line"></div>

                            <p className="detail-description">
                                {selectedMemory.description}
                            </p>

                            <div className="detail-footer">
                                <span>Kept in Everly</span>
                                <span>♡</span>
                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default ViewMemory;