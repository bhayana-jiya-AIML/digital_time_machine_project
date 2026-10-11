import { useState } from "react";

function AddMemory({ userId, onBack, onMemoryAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("location", location);
      formData.append("tags", tags);
      formData.append("userId", Number(userId));

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("http://localhost:5000/memories", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save memory");
      }

      console.log("Memory saved successfully:", data);

      alert("Memory saved successfully! ❤️");

      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      setTags("");
      setImage(null);

      // Reset file input visually
      const fileInput = document.getElementById("memory-image");

      if (fileInput) {
        fileInput.value = "";
      }

      if (onMemoryAdded) {
        onMemoryAdded(data.memory);
      }

    } catch (error) {
      console.error("Error saving memory:", error);

      alert(
        error.message || "Failed to save memory. Please try again."
      );

    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="everly-memory-page">

      {/* BACKGROUND DECORATION */}
      <div className="everly-memory-orb orb-pink"></div>
      <div className="everly-memory-orb orb-purple"></div>
      <div className="everly-memory-orb orb-gold"></div>


      {/* NAVBAR */}
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


      {/* MAIN */}
      <main className="everly-memory-content">

        {/* LEFT SIDE */}
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
            Some moments are too beautiful to
            simply let them pass.
          </p>

          <p className="everly-memory-description secondary">
            Give this little piece of your story
            a home in Everly. ♡
          </p>


          {/* NOTE */}
          <div className="everly-memory-note">

            <div className="note-decoration">
              ✦
            </div>

            <div className="note-writing">
              <span>dear future me,</span>
              <strong>remember how this felt.</strong>
            </div>

            <div className="note-heart">
              ♡
            </div>

          </div>


          <div className="floating-heart">
            ♡
          </div>

          <div className="floating-star">
            ✦
          </div>

        </section>


        {/* RIGHT SIDE FORM */}
        <section className="everly-memory-right">

          <div className="everly-memory-card">

            {/* CARD HEADER */}
            <div className="everly-card-header">

              <div>
                <span className="everly-card-label">
                  YOUR MEMORY
                </span>

                <h2>
                  What happened?
                </h2>

                <p>
                  Tell Everly about this little moment.
                </p>
              </div>

              <div className="everly-card-sparkle">
                ✦
              </div>

            </div>


            {/* FORM */}
            <form
              className="everly-memory-form"
              onSubmit={handleSubmit}
            >

              {/* TITLE */}
              <div className="everly-form-group">

                <label htmlFor="memory-title">
                  Memory title
                </label>

                <input
                  id="memory-title"
                  type="text"
                  placeholder="Give this memory a name..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

              </div>


              {/* DESCRIPTION */}
              <div className="everly-form-group">

                <label htmlFor="memory-description">
                  Your story
                </label>

                <textarea
                  id="memory-description"
                  placeholder="What happened? How did this moment feel?"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  required
                />

              </div>


              {/* DATE + LOCATION */}
              <div className="everly-two-column">

                <div className="everly-form-group">

                  <label htmlFor="memory-date">
                    When?
                  </label>

                  <input
                    id="memory-date"
                    type="date"
                    value={date}
                    onChange={(e) =>
                      setDate(e.target.value)
                    }
                    required
                  />

                </div>


                <div className="everly-form-group">

                  <label htmlFor="memory-location">
                    Where?
                  </label>

                  <input
                    id="memory-location"
                    type="text"
                    placeholder="A place..."
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                  />

                </div>

              </div>


              {/* TAGS */}
              <div className="everly-form-group">

                <label htmlFor="memory-tags">
                  Little tags
                </label>

                <input
                  id="memory-tags"
                  type="text"
                  placeholder="friends, college, birthday..."
                  value={tags}
                  onChange={(e) =>
                    setTags(e.target.value)
                  }
                />

                <span className="everly-form-hint">
                  Add a few words to find this memory later.
                </span>

              </div>


              {/* PHOTO */}
              <div className="everly-form-group">

                <label htmlFor="memory-image">
                  Add a photo
                </label>

                <input
                  id="memory-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];

                    if (selectedFile) {
                      setImage(selectedFile);
                    } else {
                      setImage(null);
                    }
                  }}
                />

                <span className="everly-form-hint">
                  Optional • Choose a photo from your device • Max 5 MB
                </span>

              </div>


              {/* SAVE BUTTON */}
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


            {/* CARD FOOTER */}
            <div className="everly-card-footer">
              <span>✦</span>
              this moment will stay with you
              <span>✦</span>
            </div>

          </div>

        </section>

      </main>


      {/* FOOTER */}
      <footer className="everly-memory-footer">

        <div className="everly-footer-brand">
          Everly <span>✦</span>
        </div>

        <p>
          A little place for the moments that matter.
        </p>

        <div className="everly-footer-created">
          Created with ♡ by Jiya • Kuhu Chandna
        </div>

      </footer>

    </div>
  );
}

export default AddMemory;