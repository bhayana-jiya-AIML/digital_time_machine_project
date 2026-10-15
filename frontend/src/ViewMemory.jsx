
import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

function ViewMemory({ userId, onBack }) {
    const [memories, setMemories] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");

    // Convert relative upload paths into complete URLs.
    const getImageUrl = (url) => {
        if (!url || typeof url !== "string") return "";

        if (
            url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("blob:")
        ) {
            return url;
        }

        return `${API_URL}/${url.replace(/^\/+/, "")}`;
    };

    // Safely format dates.
    const formatDate = (date) => {
        if (!date) return "A moment worth remembering";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "A moment worth remembering";
        }

        return parsedDate.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Collect media from all supported response formats.
    const getMemoryMedia = (memory) => {
        const mediaItems = [
            ...(Array.isArray(memory.media) ? memory.media : []),
            ...(Array.isArray(memory.images) ? memory.images : []),
            ...(Array.isArray(memory.videos) ? memory.videos : []),
        ];

        // Support older memories that use imageUrl.
        if (memory.imageUrl) {
            mediaItems.push({
                id: `legacy-${memory.id}`,
                url: memory.imageUrl,
                type: "image",
            });
        }

        // Remove duplicate URLs if the API returns media in
        // more than one property.
        const seen = new Set();

        return mediaItems.filter((item) => {
            if (!item || !item.url) return false;

            const key = `${item.type || "image"}-${item.url}`;

            if (seen.has(key)) return false;

            seen.add(key);
            return true;
        });
    };

    // Determine whether a media item is a video.
    const isVideoMedia = (item) => {
        if (!item) return false;

        if (String(item.type || "").toLowerCase() === "video") {
            return true;
        }

        return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(
            item.url || ""
        );
    };

    // Fetch memories from the backend.
    useEffect(() => {
        let isActive = true;

        const fetchMemories = async () => {
            setLoading(true);
            setFetchError("");

            if (!userId) {
                setMemories([]);
                setSelectedMemory(null);
                setSelectedYear("");
                setFetchError("Please log in to view your memories.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `${API_URL}/memories/${userId}`
                );

                const data = await response.json();

                console.log("Memories API status:", response.status);
                console.log("Memories API response:", data);

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch memories."
                    );
                }

                const memoryList = Array.isArray(data)
                    ? data
                    : Array.isArray(data.memories)
                    ? data.memories
                    : Array.isArray(data.data)
                    ? data.data
                    : [];

                console.log("Loaded memories:", memoryList);

                if (isActive) {
                    setMemories(memoryList);
                    setSelectedMemory(null);
                    setFetchError("");
                }
            } catch (error) {
                console.error("Error fetching memories:", error);

                if (isActive) {
                    setMemories([]);
                    setSelectedMemory(null);
                    setFetchError(
                        error.message ||
                            "Unable to load your memories."
                    );
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchMemories();

        return () => {
            isActive = false;
        };
    }, [userId]);

    // Get all available years.
    const years = [
        ...new Set(
            memories
                .filter((memory) => memory.date)
                .map((memory) =>
                    new Date(memory.date).getFullYear()
                )
                .filter((year) => !Number.isNaN(year))
        ),
    ].sort((a, b) => b - a);

    // Filter memories according to selected year.
    const filteredMemories = selectedYear
        ? memories.filter(
              (memory) =>
                  memory.date &&
                  new Date(memory.date).getFullYear() ===
                      Number(selectedYear)
          )
        : [];

    // Loading screen.
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
            <div className="view-glow view-glow-1"></div>
            <div className="view-glow view-glow-2"></div>
            <div className="view-glow view-glow-3"></div>

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

            <div className="memory-star star-1">✦</div>
            <div className="memory-star star-2">✧</div>
            <div className="memory-star star-3">✦</div>
            <div className="memory-star star-4">✧</div>
            <div className="memory-star star-5">✦</div>
            <div className="memory-star star-6">✧</div>
            <div className="memory-star star-7">✦</div>
            <div className="memory-star star-8">✧</div>

            <div className="memory-doodle doodle-heart-1">♡</div>
            <div className="memory-doodle doodle-heart-2">♡</div>
            <div className="memory-doodle doodle-heart-3">♥</div>
            <div className="memory-doodle doodle-sparkle-1">✧</div>
            <div className="memory-doodle doodle-sparkle-2">✦</div>
            <div className="memory-doodle doodle-flower-1">❀</div>

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

            <main className="view-memory-main">
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

                {fetchError ? (
                    <div className="empty-memories">
                        <div className="empty-icon">♡</div>

                        <h2>We couldn't load your memories.</h2>

                        <p>{fetchError}</p>

                        <button
                            className="year-button"
                            onClick={() => window.location.reload()}
                        >
                            Try again ↻
                        </button>
                    </div>
                ) : years.length === 0 ? (
                    <div className="empty-memories">
                        <div className="empty-icon">♡</div>

                        <h2>Nothing here yet.</h2>

                        <p>
                            Your beautiful memories are waiting
                            <br />
                            to be added.
                        </p>
                    </div>
                ) : (
                    <>
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
                                            Number(selectedYear) === year
                                                ? "year-button active"
                                                : "year-button"
                                        }
                                        onClick={() => {
                                            setSelectedYear(
                                                Number(selectedYear) === year
                                                    ? ""
                                                    : String(year)
                                            );
                                            setSelectedMemory(null);
                                        }}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </section>

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
                                            No memories saved for this year
                                            yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="memory-card-grid">
                                        {filteredMemories.map((memory) => {
                                            const media = getMemoryMedia(memory);
                                            const cover = media[0];

                                            return (
                                                <button
                                                    type="button"
                                                    key={memory.id}
                                                    className="memory-flashcard"
                                                    onClick={() =>
                                                        setSelectedMemory(memory)
                                                    }
                                                >
                                                    <div className="memory-card-image">
                                                        {cover ? (
                                                            isVideoMedia(cover) ? (
                                                                <div className="memory-video-cover">
                                                                    <video
                                                                        src={getImageUrl(
                                                                            cover.url
                                                                        )}
                                                                        muted
                                                                        preload="metadata"
                                                                    />
                                                                    <span className="memory-video-icon">
                                                                        ▶
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <img
                                                                    src={getImageUrl(
                                                                        cover.url
                                                                    )}
                                                                    alt={
                                                                        memory.title ||
                                                                        "Memory"
                                                                    }
                                                                />
                                                            )
                                                        ) : (
                                                            <div className="memory-placeholder">
                                                                <span>✦</span>
                                                            </div>
                                                        )}

                                                        {media.length > 1 && (
                                                            <span className="memory-media-count">
                                                                ✧ {media.length} photos/videos
                                                            </span>
                                                        )}

                                                        <div className="memory-card-overlay">
                                                            <span>
                                                                Open memory →
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="memory-card-content">
                                                        <span className="memory-card-date">
                                                            {formatDate(memory.date)}
                                                        </span>

                                                        <h3>{memory.title}</h3>

                                                        {memory.location && (
                                                            <p>
                                                                ♡ {memory.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        )}
                    </>
                )}
            </main>

            {selectedMemory && (
                <div
                    className="memory-detail-overlay"
                    onClick={() => setSelectedMemory(null)}
                >
                    <div
                        className="memory-detail-card"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="memory-detail-close"
                            onClick={() => setSelectedMemory(null)}
                            aria-label="Close memory details"
                        >
                            ×
                        </button>

                        <div className="memory-detail-content">
                            <span className="detail-date">
                                {formatDate(selectedMemory.date)}
                            </span>

                            <h2>{selectedMemory.title}</h2>

                            {selectedMemory.location && (
                                <div className="detail-location">
                                    ♡ {selectedMemory.location}
                                </div>
                            )}

                            {selectedMemory.tags && (
                                <div className="detail-tags">
                                    {String(selectedMemory.tags)
                                        .split(",")
                                        .map((tag) => tag.trim())
                                        .filter(Boolean)
                                        .map((tag, index) => (
                                            <span key={`${tag}-${index}`}>
                                                #{tag}
                                            </span>
                                        ))}
                                </div>
                            )}

                            <div className="detail-line"></div>

                            <p className="detail-description">
                                {selectedMemory.description}
                            </p>

                            {/* All attached photos and videos */}
                            {getMemoryMedia(selectedMemory).length > 0 && (
                                <div className="memory-detail-media">
                                    {getMemoryMedia(selectedMemory).map(
                                        (item, index) => (
                                            <div
                                                className="memory-detail-media-item"
                                                key={
                                                    item.id ??
                                                    `${item.url}-${index}`
                                                }
                                            >
                                                {isVideoMedia(item) ? (
                                                    <video
                                                        src={getImageUrl(item.url)}
                                                        controls
                                                        preload="metadata"
                                                        className="memory-detail-video"
                                                    />
                                                ) : (
                                                    <img
                                                        src={getImageUrl(item.url)}
                                                        alt={`Memory attachment ${
                                                            index + 1
                                                        }`}
                                                        className="memory-detail-photo"
                                                    />
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            )}

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
