import { useState } from "react";

function AddMemory({ userId, onBack, onMemoryAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image.`);
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds the 5 MB limit.`);
        return false;
      }

      return true;
    });

    setImages((previous) => [...previous, ...validFiles]);
    e.target.value = "";
  };

  const handleVideoChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) => {
      if (!file.type.startsWith("video/")) {
        alert(`${file.name} is not a video.`);
        return false;
      }

      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} exceeds the 50 MB limit.`);
        return false;
      }

      return true;
    });

    setVideos((previous) => [...previous, ...validFiles]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((previous) => previous.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideos((previous) => previous.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Please log in before saving a memory.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("location", location);
      formData.append("tags", tags);
      formData.append("userId", Number(userId));

      images.forEach((image) => {
        formData.append("images", image);
      });

      videos.forEach((video) => {
        formData.append("videos", video);
      });

      const response = await fetch("http://localhost:5000/memories", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save memory.");
      }

      alert("Memory saved successfully! ❤️");

      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      setTags("");
      setImages([]);
      setVideos([]);

      if (onMemoryAdded) {
        onMemoryAdded(data.memory);
      }
    } catch (error) {
      console.error("Error saving memory:", error);
      alert(error.message || "Failed to save memory. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="everly-memory-page">
      <div className="everly-memory-orb orb-pink"></div>
      <div className="everly-memory-orb orb-purple"></div>
      <div className="everly-memory-orb orb-gold"></div>

      <nav className="everly-memory-nav">
        <div className="everly-memory-brand">
          Everly <span>✦</span>
        </div>

        <button
          type="button"
          className="everly-memory-back"
          onClick={onBack}
        >
          ← Back to dashboard
        </button>
      </nav>

      <main className="everly-memory-content">
        <section className="everly-memory-left">
          <div className="everly-memory-eyebrow">
            A LITTLE MOMENT WORTH KEEPING
          </div>

          <h1>
            Save this
            <br />
            <em>memory.</em>
          </h1>

          <p className="everly-memory-description">
            Some moments are too beautiful to simply let them pass.
          </p>

          <p className="everly-memory-description secondary">
            Give this little piece of your story a home in Everly. ♡
          </p>

          <div className="everly-memory-note">
            <div className="note-decoration">✦</div>
            <div className="note-writing">
              <span>dear future me,</span>
              <strong>remember how this felt.</strong>
            </div>
            <div className="note-heart">♡</div>
          </div>

          <div className="floating-heart">♡</div>
          <div className="floating-star">✦</div>
        </section>

        <section className="everly-memory-right">
          <div className="everly-memory-card">
            <div className="everly-card-header">
              <div>
                <span className="everly-card-label">YOUR MEMORY</span>
                <h2>What happened?</h2>
                <p>Tell Everly about this little moment.</p>
              </div>

              <div className="everly-card-sparkle">✦</div>
            </div>

            <form className="everly-memory-form" onSubmit={handleSubmit}>
              <div className="everly-form-group">
                <label htmlFor="memory-title">Memory title</label>
                <input
                  id="memory-title"
                  type="text"
                  placeholder="Give this memory a name..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="everly-form-group">
                <label htmlFor="memory-description">Your story</label>
                <textarea
                  id="memory-description"
                  placeholder="What happened? How did this moment feel?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="everly-two-column">
                <div className="everly-form-group">
                  <label htmlFor="memory-date">When?</label>
                  <input
                    id="memory-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="everly-form-group">
                  <label htmlFor="memory-location">Where?</label>
                  <input
                    id="memory-location"
                    type="text"
                    placeholder="A place..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="everly-form-group">
                <label htmlFor="memory-tags">Little tags</label>
                <input
                  id="memory-tags"
                  type="text"
                  placeholder="friends, college, birthday..."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <span className="everly-form-hint">
                  Add a few words to find this memory later.
                </span>
              </div>

              <div className="everly-form-group">
                <label htmlFor="memory-images">Add photos 📸</label>

                <input
                  id="memory-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />

                <span className="everly-form-hint">
                  Choose multiple photos • Maximum 5 MB per photo
                </span>

                {images.length > 0 && (
                  <div className="selected-media-list">
                    {images.map((image, index) => (
                      <div
                        className="selected-media-item"
                        key={`${image.name}-${image.lastModified}-${index}`}
                      >
                        <span>🖼️ {image.name}</span>

                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          aria-label={`Remove ${image.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="everly-form-group">
                <label htmlFor="memory-videos">Add videos 🎥</label>

                <input
                  id="memory-videos"
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoChange}
                />

                <span className="everly-form-hint">
                  Choose multiple videos • Maximum 50 MB per video
                </span>

                {videos.length > 0 && (
                  <div className="selected-media-list">
                    {videos.map((video, index) => (
                      <div
                        className="selected-media-item"
                        key={`${video.name}-${video.lastModified}-${index}`}
                      >
                        <span>🎬 {video.name}</span>

                        <button
                          type="button"
                          onClick={() => removeVideo(index)}
                          aria-label={`Remove ${video.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="everly-save-memory"
                disabled={saving}
              >
                <span>
                  {saving ? "Saving..." : "Save this memory"}
                </span>

                <span className="save-heart">
                  {saving ? "…" : "♡"}
                </span>
              </button>
            </form>

            <div className="everly-card-footer">
              <span>✦</span>
              this moment will stay with you
              <span>✦</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="everly-memory-footer">
        <div className="everly-footer-brand">
          Everly <span>✦</span>
        </div>

        <p>A little place for the moments that matter.</p>

        <div className="everly-footer-created">
          Created with ♡ by Jiya • Kuhu Chandna
        </div>
      </footer>
    </div>
  );
}

export default AddMemory;