import React, { useState, useEffect, useRef } from "react";
import NoResultsIllustration from '../assets/no-results-illustration.png';
import ClashCard from "./ClashCard";
import { useNavigate } from "react-router-dom";

const ClashFeedOriginal = ({ user, forceOpenForm, onFormOpened }) => {
  const [statement, setStatement] = useState("");
  const [titleValue, setTitleValue] = useState("");
  const [selectedSide, setSelectedSide] = useState(null);
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clashes, setClashes] = useState([]);
  const [titleError, setTitleError] = useState("");
  const [statementError, setStatementError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const formRef = useRef(null);
  const isLoggedIn = Boolean(user);
  const navigate = useNavigate();

  // Load saved form data from localStorage
  useEffect(() => {
    const savedTitle = localStorage.getItem("vs_title");
    const savedStatement = localStorage.getItem("vs_statement");
    if (savedTitle) setTitleValue(savedTitle);
    if (savedStatement) setStatement(savedStatement);
  }, []);

  // Save form data to localStorage
  useEffect(() => {
    localStorage.setItem("vs_title", titleValue);
    localStorage.setItem("vs_statement", statement);
    localStorage.setItem("vs_side", selectedSide || "");
  }, [titleValue, statement, selectedSide]);

  useEffect(() => {
    if (forceOpenForm) {
      setShowDetailedForm(true);
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
        onFormOpened();
      }, 100);
    }
  }, [forceOpenForm, onFormOpened]);

  // Fetch all clashes on mount
  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:8080/api/clashes", {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(data => {
        setClashes(Array.isArray(data) ? data : []);
      })
      .catch(() => setClashes([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleInputChange = (e) => {
    setStatement(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReleaseClash();
    }
  };

  const handleReleaseClash = async () => {
    if (!isLoggedIn) return;
    if (!titleValue.trim()) {
      setTitleError("Please enter a title for your clash!");
      setTimeout(() => setTitleError(""), 3000);
      return;
    }
    if (!selectedSide) {
      setTitleError("Please pick a side!");
      setTimeout(() => setTitleError(""), 3000);
      return;
    }
    if (!statement.trim()) {
      setStatementError("Please add your bold statement!");
      setTimeout(() => setStatementError(""), 3000);
      return;
    }
    if (statement.trim().length < 25) {
      setStatementError("Your statement is too short. Please write at least 25 characters.");
      setTimeout(() => setStatementError(""), 3000);
      return;
    }
    setTitleError("");
    setStatementError("");
    setIsLoading(true);
    const clashData = {
      vs_title: titleValue,
      vs_statement: statement,
      side: selectedSide,
      creator: user?._id,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
    try {
      const response = await fetch("http://localhost:8080/api/clashes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(clashData)
      });
      if (!response.ok) throw new Error("Failed to create clash");
      const result = await response.json();
      setClashes(prev => [result, ...prev]);
      setShowSuccessMessage(true);
      handleClearForm();
      setTimeout(() => {
        setShowSuccessMessage(false);
        setShowDetailedForm(false);
      }, 3000);
    } catch (err) {
      alert("Failed to create clash. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearForm = () => {
    setTitleValue("");
    setStatement("");
    setSelectedSide(null);
    localStorage.removeItem("vs_title");
    localStorage.removeItem("vs_statement");
    localStorage.removeItem("vs_side");
  };

  return (
    <>
      {showSuccessMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-xl z-50 bg-bgwhite dark:bg-secondary border border-muted rounded-2xl shadow-lg p-5 transition-all duration-300">
          <div className="flex flex-col gap-2">
            <h3 className="text-heading text-secondary flex items-center gap-2 mb-2">
              ⚔️ Clash Created!
            </h3>
            <div className="text-caption text-mutedDark">Here's your newly released clash:</div>
            <div className="border border-muted rounded-xl p-3 bg-muted25 dark:bg-muted-dark">
              <div className="text-subheading text-secondary font-semibold mb-1">{titleValue}</div>
              <div className="text-body text-mutedDark mb-2">{statement}</div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-muted25 bg-[radial-gradient(circle,_#E0E2DB_1px,_transparent_1px)] bg-[length:12px_12px]">
        {/* Title and description */}
        <div className="px-4 pt-20 pb-1 mb-1">
          <h1 className="text-subheading text-secondary flex items-center gap-2">
            🔥 Clash Starts Here.
          </h1>
          <p className="text-label text-secondary opacity-50">
            Your bold statement meets its rival. AI scores both sides. The crowd decides.
          </p>
        </div>

        {/* Form section */}
        <div className="px-4 mb-6">
          <button
            onClick={() => setShowDetailedForm(!showDetailedForm)}
            className="w-full bg-bgwhite dark:bg-secondary border border-muted rounded-2xl p-4 text-left hover:bg-muted25 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-label text-secondary">Start a new clash</span>
              <span className="text-mutedDark">{showDetailedForm ? "▼" : "▲"}</span>
            </div>
          </button>

          {showDetailedForm && (
            <div className="mt-4 bg-bgwhite dark:bg-secondary border border-muted rounded-2xl p-4" ref={formRef}>
              <div className="mb-4">
                <label htmlFor="title-input" className={`block text-caption mb-1 ${titleError ? 'text-alert animate-pulse' : 'text-mutedDark'}`}>
                  {titleError || "Title"}
                </label>
                <input
                  id="title-input"
                  type="text"
                  placeholder="Enter your clash title"
                  className="w-full bg-bgwhite rounded-3xl text-caption text-secondary border border-muted focus:outline-none px-3 py-2"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="mb-4">
                <label className="block text-caption text-mutedDark mb-2">Pick your side</label>
                <div className="flex gap-4">
                  <button
                    className={`flex-1 py-3 rounded-2xl border transition-colors ${
                      selectedSide === "A"
                        ? "bg-accent text-bgwhite border-accent"
                        : "bg-bgwhite text-secondary border-muted hover:bg-muted25"
                    }`}
                    onClick={() => setSelectedSide("A")}
                  >
                    Side A
                  </button>
                  <button
                    className={`flex-1 py-3 rounded-2xl border transition-colors ${
                      selectedSide === "B"
                        ? "bg-accent text-bgwhite border-accent"
                        : "bg-bgwhite text-secondary border-muted hover:bg-muted25"
                    }`}
                    onClick={() => setSelectedSide("B")}
                  >
                    Side B
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="statement-input" className={`block text-caption mb-1 ${statementError ? 'text-alert animate-pulse' : 'text-mutedDark'}`}>
                  {statementError || "Statement"}
                </label>
                <textarea
                  id="statement-input"
                  placeholder="Why do you think your side is better?"
                  className="w-full bg-bgwhite rounded-3xl text-caption text-secondary border border-muted focus:outline-none resize-y max-h-40 px-3 py-2"
                  rows="2"
                  value={statement}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  maxLength={250}
                ></textarea>
                <p className={`text-caption opacity-75 mt-1 text-right ${statement.length > 230 ? 'text-accent' : statement.length < 25 ? 'text-accent' : 'text-mutedDark'}`}>
                  {statement.length}/250
                  {statement.length > 0 && statement.length < 25 && (
                    <span className="ml-2 text-accent opacity-75">Min. 25 characters</span>
                  )}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  className={`px-6 py-4 bg-accent text-bgwhite text-label rounded-2xl ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'}`}
                  onClick={handleReleaseClash}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">🔄</span> Processing...
                    </span>
                  ) : (
                    "Release Clash ⚔️"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clash list */}
        <div className="space-y-6 px-4 bg-bgashwhite">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-48 bg-muted25 rounded-2xl animate-pulse"
                ></div>
              ))}
            </div>
          ) : clashes.length > 0 ? (
            clashes.map((clash) => (
              <div key={`${clash._id}-${clash.createdAt}`} className="mb-10 pb-6">
                <ClashCard
                  _id={clash._id}
                  vs_title={clash.vs_title}
                  vs_statement={clash.vs_statement}
                  argument={clash.vs_argument || (clash.Clash_arguments?.[0]?.text || "")}
                  Clash_arguments={clash.Clash_arguments || []}
                  reactions={clash.reactions}
                  expires_at={clash.expires_at}
                  createdAt={clash.createdAt}
                  creator={clash.creator}
                  user={user}
                />
              </div>
            ))
          ) : (
            <div className="p-8 text-center flex flex-col items-center">
              <img
                src={NoResultsIllustration}
                alt="No results"
                className="w-40 h-40 mb-4 opacity-80"
              />
              <div className="text-label text-mutedDark mb-2">
                It's a little quiet here. How about launching the very first clash?
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClashFeedOriginal;
