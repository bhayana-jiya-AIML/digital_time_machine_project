import { useState } from "react";
import "./App.css";

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showDashboard, setShowDashboard] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginMessage, setLoginMessage] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  const date = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ================= LOGIN =================

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginMessage("Please enter your email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoggedInUser(data.user);
        setShowAuth(false);
        setShowDashboard(true);
        setLoginMessage("");

        setEmail("");
        setPassword("");
      } else {
        setLoginMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setLoginMessage("Unable to connect to server.");
    }
  };

  // ================= REGISTER =================

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setLoginMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoginMessage("Account created successfully! ♡");

        setName("");
        setPassword("");

        setAuthMode("login");
      } else {
        setLoginMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setLoginMessage("Unable to connect to server.");
    }
  };

  // =====================================================
  // DASHBOARD
  // =====================================================

  if (showDashboard && loggedInUser) {
    return (
      <div className="dashboard">

        {/* BACKGROUND GLOWS */}
        <div className="dashboard-glow glow1"></div>
        <div className="dashboard-glow glow2"></div>
        <div className="dashboard-glow glow3"></div>

        {/* NAVBAR */}
        <nav className="dashboard-navbar">

          <div className="dashboard-logo">
            Everly <span>✦</span>
          </div>

          <div className="dashboard-user">

            <span>
              Hi, {loggedInUser.name} ♡
            </span>

            <button
              onClick={() => {
                setShowDashboard(false);
                setLoggedInUser(null);
              }}
            >
              Log out
            </button>

          </div>

        </nav>


        {/* MAIN */}
        <main className="dashboard-main">

          {/* HEADER */}
          <div className="dashboard-header">

            <div className="dashboard-small-title">
              YOUR LITTLE MEMORY SPACE
            </div>

            <h1>
              Welcome back,
              <br />
              <i>{loggedInUser.name}.</i>
            </h1>

            <p>
              A place for the moments you never want
              <br />
              to forget.
            </p>

          </div>


          {/* DATE */}
          <div className="dashboard-date">

            <div>
              <span>TODAY</span>
              <strong>{date}</strong>
            </div>

            <div className="date-heart">
              ♡
            </div>

          </div>


          {/* ACTION CARDS */}
          <div className="dashboard-actions">

            {/* ADD MEMORY */}
            <div className="memory-action add-memory">

              <div className="action-icon">
                ✦
              </div>

              <div className="action-content">

                <span className="action-number">
                  01
                </span>

                <h2>
                  Add a Memory
                </h2>

                <p>
                  Save a moment, photograph,
                  thought or little story.
                </p>

                <button
                  className="dashboard-main-button"
                  onClick={() => alert("Add Memory feature coming next!")}
                >
                  Add Memory
                  <span>＋</span>
                </button>

              </div>

            </div>


            {/* VIEW MEMORIES */}
            <div className="memory-action view-memory">

              <div className="action-icon">
                ♡
              </div>

              <div className="action-content">

                <span className="action-number">
                  02
                </span>

                <h2>
                  My Memories
                </h2>

                <p>
                  Revisit everything you've
                  chosen to keep.
                </p>

                <button
                  className="dashboard-main-button"
                  onClick={() => alert("Memory retrieval feature coming next!")}
                >
                  View Memories
                  <span>→</span>
                </button>

              </div>

            </div>

          </div>


          {/* QUOTE */}
          <div className="dashboard-quote">

            <span>“</span>

            <p>
              Some moments are ordinary
              <br />
              until they become memories.
            </p>

            <small>
              — Everly
            </small>

          </div>

        </main>


        {/* FOOTER */}
        <footer className="dashboard-footer">

          <div>
            <h3>
              Everly ✦
            </h3>

            <p>
              A little place for the moments that matter.
            </p>
          </div>

          <div className="creators">

            <span>
              Created with ♡ by
            </span>

            <strong>
              Jiya&nbsp;&nbsp;•&nbsp;&nbsp;Kuhu Chandna
            </strong>

          </div>

        </footer>

      </div>
    );
  }

  // =====================================================
  // LANDING PAGE
  // =====================================================

  return (
    <div className="app">

      {/* BACKGROUND */}
      <div className="glow glow1"></div>
      <div className="glow glow2"></div>
      <div className="glow glow3"></div>

      {/* NAVBAR */}
      <nav className="navbar">

        <div className="nav-symbol">
          ✦
        </div>

        <div className="nav-right">

          <a href="#about">
            About
          </a>

          <a href="#memories">
            Memories
          </a>

          <a href="#how">
            How it works
          </a>

          <button
            onClick={() => {
              setAuthMode("login");
              setLoginMessage("");
              setShowAuth(true);
            }}
          >
            Enter Everly
          </button>

        </div>

      </nav>


      {/* HERO */}
      <section className="hero">

        {/* MOVING TEXT */}
        <div className="moving moving1">
          memories · moments · stories · little things ·
        </div>

        <div className="moving moving2">
          yesterday · today · tomorrow · always ·
        </div>

        <div className="moving moving3">
          keep it forever · remember this ·
        </div>


        {/* NOTES */}
        <div className="note note1">
          dear future me,
          <br />
          remember this ♡
        </div>

        <div className="note note2">
          little moments
          <br />
          become everything
        </div>

        <div className="note note3">
          keep this one ✦
        </div>

        <div className="note note4">
          somewhere in time...
        </div>

        <div className="note note5">
          this felt like
          <br />
          forever ♡
        </div>

        <div className="note note6">
          don't forget
        </div>


        {/* DOODLES */}
        <div className="doodle d1">
          ♡
        </div>

        <div className="doodle d2">
          ✦
        </div>

        <div className="doodle d3">
          ✧
        </div>

        <div className="doodle d4">
          ♡
        </div>

        <div className="doodle d5">
          ☼
        </div>

        <div className="doodle d6">
          ✿
        </div>


        {/* POLAROIDS */}
        <div className="polaroid p1">

          <div className="photo photo1">
            <span>✦</span>
          </div>

          <div className="caption">
            one beautiful day
          </div>

        </div>


        <div className="polaroid p2">

          <div className="photo photo2">
            <span>♡</span>
          </div>

          <div className="caption">
            remember this
          </div>

        </div>


        <div className="polaroid p3">

          <div className="photo photo3">
            <span>☼</span>
          </div>

          <div className="caption">
            somewhere we smiled
          </div>

        </div>


        {/* HERO CONTENT */}
        <div className="hero-content">

          <div className="eyebrow">
            A LITTLE PLACE FOR
          </div>

          <h1>
            Everly
          </h1>

          <div className="date-card">

            <span>
              today
            </span>

            <strong>
              {date}
            </strong>

          </div>

          <div className="brand-line">
            YOUR MEMORIES · YOUR STORY
          </div>

          <div className="divider">

            <span></span>

            ✦

            <span></span>

          </div>

          <h2>
            Keep the moments
            <br />
            that <i>matter.</i>
          </h2>

          <p>
            A dreamy little space to preserve the
            photographs, thoughts and memories
            that make your story yours.
          </p>

          <button
            className="main-button"
            onClick={() => {
              setAuthMode("login");
              setLoginMessage("");
              setShowAuth(true);
            }}
          >
            Begin your journey

            <span>
              →
            </span>

          </button>

        </div>


        <div className="scroll">

          SCROLL TO EXPLORE

          <span>
            ↓
          </span>

        </div>

      </section>


      {/* ABOUT */}
      <section
        className="about"
        id="about"
      >

        <div className="section-tag">
          YOUR DIGITAL TIME CAPSULE
        </div>

        <h2>
          Some moments are
          <br />
          too beautiful to <i>forget.</i>
        </h2>

        <p>
          Everly gives your memories a little home of their own.
          Save photographs, write your thoughts, revisit old moments
          and create a timeline of the life you've lived.
        </p>

        <div className="about-heart">
          ♡
        </div>

      </section>


      {/* FEATURES */}
      <section
        className="features"
        id="memories"
      >

        <div className="section-tag">
          MADE FOR YOUR MEMORIES
        </div>

        <h2>
          Everything that makes
          <br />
          your story <i>yours.</i>
        </h2>

        <div className="feature-grid">

          <div className="feature feature1">
            <span>♡</span>

            <h3>
              Memories
            </h3>

            <p>
              Save the moments you never want
              to lose.
            </p>

            <small>
              01
            </small>
          </div>


          <div className="feature feature2">
            <span>✎</span>

            <h3>
              Journal
            </h3>

            <p>
              Give your thoughts a place
              to stay.
            </p>

            <small>
              02
            </small>
          </div>


          <div className="feature feature3">
            <span>◉</span>

            <h3>
              Timeline
            </h3>

            <p>
              Watch your memories unfold
              through time.
            </p>

            <small>
              03
            </small>
          </div>


          <div className="feature feature4">
            <span>✦</span>

            <h3>
              Time Capsule
            </h3>

            <p>
              Leave something beautiful
              for your future self.
            </p>

            <small>
              04
            </small>
          </div>

        </div>

      </section>


      {/* QUOTE */}
      <section className="quote">

        <div className="quote-symbol">
          “
        </div>

        <h2>
          We remember
          <br />
          because we <i>loved.</i>
        </h2>

        <p>
          Every little detail becomes a part
          of the story we carry with us.
        </p>

      </section>


      {/* HOW */}
      <section
        className="how"
        id="how"
      >

        <div className="section-tag">
          YOUR STORY, YOUR WAY
        </div>

        <h2>
          From a moment
          <br />
          to a <i>memory.</i>
        </h2>

        <div className="steps">

          <div className="step">

            <b>
              01
            </b>

            <div>

              <h3>
                Capture
              </h3>

              <p>
                Add photographs, notes and
                little moments from your life.
              </p>

            </div>

          </div>


          <div className="step">

            <b>
              02
            </b>

            <div>

              <h3>
                Preserve
              </h3>

              <p>
                Organize everything into
                your own personal timeline.
              </p>

            </div>

          </div>


          <div className="step">

            <b>
              03
            </b>

            <div>

              <h3>
                Relive
              </h3>

              <p>
                Come back whenever you want
                and rediscover your story.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* FINAL CTA */}
      <section className="final-cta">

        <div className="sparkle">
          ✦
        </div>

        <h2>
          Your memories deserve
          <br />
          a place called <i>Everly.</i>
        </h2>

        <button
          className="main-button dark-button"
          onClick={() => {
            setAuthMode("login");
            setLoginMessage("");
            setShowAuth(true);
          }}
        >
          Create your memory space

          <span>
            →
          </span>

        </button>

      </section>


      {/* FOOTER */}
      <footer>

        <div>

          <h3>
            Everly
          </h3>

          <p>
            A little place for the moments that matter.
          </p>

        </div>

        <div className="creators">

          <span>
            Created with ♡ by
          </span>

          <strong>
            Jiya&nbsp;&nbsp;•&nbsp;&nbsp;Kuhu Chandna
          </strong>

        </div>

      </footer>


      {/* AUTH MODAL */}
      {showAuth && (

        <div className="modal">

          <div className="login-card">

            <button
              className="close"
              onClick={() => {
                setShowAuth(false);
                setLoginMessage("");
              }}
            >
              ×
            </button>

            <div className="login-logo">
              Everly
            </div>


            {/* LOGIN */}
            {authMode === "login" ? (

              <>

                <h2>
                  Welcome back,
                  <br />
                  memory keeper ♡
                </h2>

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  className="login-button"
                  onClick={handleLogin}
                >
                  Enter Everly
                </button>

                <p className="auth-switch">

                  New to Everly?{" "}

                  <button
                    onClick={() => {
                      setAuthMode("register");
                      setLoginMessage("");
                    }}
                  >
                    Create an account ♡
                  </button>

                </p>

              </>

            ) : (

              /* REGISTER */

              <>

                <h2>
                  Create your
                  <br />
                  memory space ♡
                </h2>

                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  className="login-button"
                  onClick={handleRegister}
                >
                  Create my Everly
                </button>

                <p className="auth-switch">

                  Already have an account?{" "}

                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setLoginMessage("");
                    }}
                  >
                    Login ♡
                  </button>

                </p>

              </>

            )}


            {loginMessage && (

              <p className="login-message">
                {loginMessage}
              </p>

            )}

            <p>
              your little corner of time
            </p>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;

