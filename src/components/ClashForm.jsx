import React, { useState, useEffect, useRef } from "react";
import { sanitizeInput } from "../utils/gptUtils.js";

const ClashForm = ({ 
  user, 
  forceOpenForm, 
  onFormOpened, 
  onClashCreated,
  onSuccess 
}) => {
  // State variables
  const lastClashTimestampRef = useRef(0);
  const formRef = useRef(null);
  const [statement, setStatement] = useState("");
  const [titleValue, setTitleValue] = useState("");
  const [selectedSide, setSelectedSide] = useState(null);
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [statementError, setStatementError] = useState("");
  const [statementInfoMessage, setStatementInfoMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showSideError, setShowSideError] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [aiLoadingField, setAiLoadingField] = useState(null);
  const [pendingClashData, setPendingClashData] = useState(null);
  const isLoggedIn = Boolean(user);

  // Side title states
  const [sideATitle, setSideATitle] = useState("Side A");
  const [sideBTitle, setSideBTitle] = useState("Side B");
  const [fullSideATitle, setFullSideATitle] = useState("Side A");
  const [fullSideBTitle, setFullSideBTitle] = useState("Side B");

  // Load saved form data from localStorage
  useEffect(() => {
    const savedTitle = localStorage.getItem("vs_title");
    const savedStatement = localStorage.getItem("vs_statement");
    const savedSide = localStorage.getItem("vs_side");
    const savedTags = localStorage.getItem("vs_tags");

    if (savedTitle) setTitleValue(savedTitle);
    if (savedStatement) setStatement(savedStatement);
    if (savedTags) {
      try {
        const parsedTags = JSON.parse(savedTags);
        if (Array.isArray(parsedTags)) setTags(parsedTags);
      } catch (e) {
        console.error("Failed to parse saved tags:", e);
      }
    }
  }, []);

  // Save form data to localStorage
  useEffect(() => {
    localStorage.setItem("vs_title", titleValue);
    localStorage.setItem("vs_statement", statement);
    localStorage.setItem("vs_side", selectedSide || "");
    localStorage.setItem("vs_tags", JSON.stringify(tags));
  }, [titleValue, statement, selectedSide, tags]);

  // Handle forceOpenForm prop
  useEffect(() => {
    if (forceOpenForm) {
      setShowDetailedForm(true);
      // Small delay to ensure smooth transition
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
        onFormOpened?.();
      }, 100);
    }
  }, [forceOpenForm, onFormOpened]);

  // Random VS examples
  const randomVsExamples = [
    "Netflix vs YouTube",
    "Instagram vs TikTok",
    "Pizza vs Burger",
    "Apple vs Samsung",
    "Football vs Basketball",
    "Coffee vs Tea",
    "Summer vs Winter",
    "Movies vs Books",
    "PlayStation vs Xbox",
    "Android vs iOS"
  ];

  // Get random VS
  const getRandomVs = () => {
    const randomIndex = Math.floor(Math.random() * randomVsExamples.length);
    const randomVs = randomVsExamples[randomIndex];
    setTitleValue(randomVs);
    updateSideTitles(randomVs);
  };

  // Input change handlers
  const handleInputChange = (event) => {
    const val = event.target.value;
    setStatement(val);
  };

  const handleTitleChange = (event) => {
    const val = event.target.value;
    setTitleValue(val);
    if (statement.trim()) {
      setStatement("");
      setStatementInfoMessage("🧹 New title, new vibe. Statement reset!");
      setTimeout(() => setStatementInfoMessage(""), 3000);
    }
    updateSideTitles(val);
  };

  // Key press handler
  const handleKeyPress = (event) => {
    if (!isLoggedIn) return;

    if (event.key === "Enter") {
      if (!showDetailedForm && titleValue.trim() !== "") {
        handleStartNewClash();
      } else if (showDetailedForm) {
        if (event.target.id === "title-vs-input" && titleValue.trim() !== "") {
          document.getElementById("statement-input")?.focus();
        } else if (event.target.id === "statement-input" && statement.trim().length >= 10) {
          document.getElementById("supporting-argument-input")?.focus();
        } else if (event.target.id === "supporting-argument-input") {
          handleReleaseClash();
        }
      }
    }
  };

  // Side change handler
  const handleSideChange = (side) => {
    setSelectedSide(side);
    if (statement.trim()) {
      setStatement("");
      setStatementInfoMessage("🌀 You switched sides. Statement cleared!");
      setTimeout(() => setStatementInfoMessage(""), 3000);
    }
  };

  // Update side titles
  const updateSideTitles = (text) => {
    if (!text || text.trim() === "") {
      setSideATitle("Side A");
      setSideBTitle("Side B");
      setFullSideATitle("Side A");
      setFullSideBTitle("Side B");
      return;
    }

    const formatSideTitle = (title) => {
      const fullTitle = title.trim();
      const displayTitle = fullTitle.length > 10 ? fullTitle.substring(0, 10) + '…' : fullTitle;
      return { fullTitle, displayTitle };
    };

    const extractMeaningfulParts = (text) => {
      const words = text.trim().split(/\s+/);
      
      if (words.length >= 4) {
        return {
          sideA: words.slice(0, 2).join(" "),
          sideB: words.slice(-2).join(" ")
        };
      } else if (words.length === 3) {
        return {
          sideA: words[0],
          sideB: words.slice(1).join(" ")
        };
      } else if (words.length === 2) {
        return {
          sideA: words[0],
          sideB: words[1]
        };
      } else {
        return {
          sideA: words[0],
          sideB: words[0]
        };
      }
    };

    const updateSides = (sideA, sideB) => {
      const { fullTitle: fullA, displayTitle: displayA } = formatSideTitle(sideA);
      const { fullTitle: fullB, displayTitle: displayB } = formatSideTitle(sideB);
      
      setFullSideATitle(fullA);
      setFullSideBTitle(fullB);
      setSideATitle(displayA);
      setSideBTitle(displayB);
    };

    const dividers = [
      ' vs ', ' vs. ', ' - ', ' or ', ' karşı ', ' against ',
      ' veya ', ' mi yoksa ', ' versus ', ' vs ', ' vs. ',
      ' versus ', ' against ', ' versus ', ' vs ', ' vs. '
    ];
    
    let foundMatch = false;
    
    for (const divider of dividers) {
      if (text.toLowerCase().includes(divider)) {
        const parts = text.split(divider);
        if (parts.length >= 2) {
          const rawA = parts[0].trim();
          const rawB = parts[1].trim();
          
          const cleanA = rawA.replace(/['"]/g, '').replace(/[.,;:!?]$/, '');
          const cleanB = rawB.replace(/['"]/g, '').replace(/[.,;:!?]$/, '');
          
          updateSides(cleanA, cleanB);
          foundMatch = true;
          break;
        }
      }
    }
    
    if (!foundMatch && text.includes("tercih ederim")) {
      const parts = text.split("tercih ederim");
      if (parts.length > 0) {
        const preferParts = parts[0].split("'");
        if (preferParts.length >= 3) {
          const rawA = preferParts[0].trim();
          const rawB = preferParts[2].trim()
            .replace(/ye$/, '')
            .replace(/ya$/, '')
            .replace(/ye$/, '')
            .replace(/ya$/, '');
          
          updateSides(rawA, rawB);
          foundMatch = true;
        }
      }
    }
    
    if (!foundMatch) {
      const { sideA, sideB } = extractMeaningfulParts(text);
      updateSides(sideA, sideB);
    }
  };

  // Start new clash
  const handleStartNewClash = () => {
    if (!isLoggedIn) return;
    setShowDetailedForm(true);
    setTimeout(() => {
      document.getElementById("supporting-argument-input")?.focus();
    }, 100);
  };

  // Release clash
  const handleReleaseClash = async () => {
    if (!isLoggedIn) return;

    if (!titleValue.trim()) {
      setTitleError("Please enter a title for your clash!");
      setTimeout(() => setTitleError(""), 3000);
      const titleInput = document.getElementById("title-vs-input");
      if (titleInput) {
        titleInput.classList.add("ring-2", "ring-accent", "animate-pulse");
        setTimeout(() => {
          titleInput.classList.remove("ring-2", "ring-accent", "animate-pulse");
        }, 1000);
      }
      return;
    }

    if (!selectedSide) {
      setShowSideError(true);
      setTimeout(() => setShowSideError(false), 3000);
      const sideButtons = document.querySelectorAll(".pick-your-side-button");
      sideButtons.forEach(button => {
        button.classList.add("ring-2", "ring-accent", "animate-pulse");
        setTimeout(() => {
          button.classList.remove("ring-2", "ring-accent", "animate-pulse");
        }, 1000);
      });
      return;
    }

    if (!statement.trim()) {
      setStatementError("Please add your bold statement!");
      setTimeout(() => setStatementError(""), 3000);
      const statementInput = document.getElementById("statement-input");
      if (statementInput) {
        statementInput.classList.add("ring-2", "ring-accent", "animate-pulse");
        setTimeout(() => {
          statementInput.classList.remove("ring-2", "ring-accent", "animate-pulse");
        }, 1000);
      }
      return;
    }

    if (statement.trim().length < 25) {
      setStatementError("Your statement is too short. Please write at least 25 characters.");
      setTimeout(() => setStatementError(""), 3000);
      const statementInput = document.getElementById("statement-input");
      if (statementInput) {
        statementInput.classList.add("ring-2", "ring-accent", "animate-pulse");
        setTimeout(() => {
          statementInput.classList.remove("ring-2", "ring-accent", "animate-pulse");
        }, 1000);
      }
      return;
    }

    setTitleError("");
    setStatementError("");

    const now = Date.now();
    const MIN_INTERVAL = 60000;
    if (now - lastClashTimestampRef.current < MIN_INTERVAL) {
      alert("You're posting too frequently. Please wait a bit before creating another clash.");
      return;
    }
    lastClashTimestampRef.current = now;

    const clashData = {
      vs_title: titleValue,
      vs_statement: statement,
      side: selectedSide,
      tags: tags,
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
      setPendingClashData(result);
      handleClearForm();
      onClashCreated?.(result);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setShowDetailedForm(false);
        onSuccess?.();
      }, 3000);
    } catch (error) {
      alert("Failed to create clash. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear form
  const handleClearForm = () => {
    setTitleValue("");
    setStatement("");
    setSelectedSide(null);
    setTags([]);
    localStorage.removeItem("vs_title");
    localStorage.removeItem("vs_statement");
    localStorage.removeItem("vs_side");
    localStorage.removeItem("vs_tags");
  };

  // AI generation
  const handleAIGenerate = async (field) => {
    if (!isLoggedIn) return;
    setAiLoadingField(field);

    try {
      const payload = {
        title: field === "title" ? "" : sanitizeInput(titleValue),
        statement: field === "statement" ? "" : sanitizeInput(statement),
        tags: tags.map(tag => sanitizeInput(tag))
      };

      if (field === "title") {
        payload.statement = sanitizeInput(statement);
        const randomTitlePrompts = [
          `
    Suggest a creative and unexpected "X vs Y" style debate title.
    It can reference trends, generational habits, technologies, foods, cultural icons, or philosophical ideas.
    Format: "X vs. Y". Keep it fun, modern, and intriguing.
    Examples: "Boomers vs. Gen Z", "Minimalism vs. Maximalism", "Street Food vs. Fine Dining", "Reality vs. Fantasy".
    Only return the title. No extra text.
    `,
          `
    Generate a quirky and viral-style "X vs. Y" debate title that could easily go viral on TikTok or Reddit. 
    Mix everyday life dilemmas, pop culture, and lifestyle choices. Keep it short and punchy.
    Only return the title.
    `,
          `
    Generate a totally random and unexpected versus-style debate title in the format "X vs. Y".
    Avoid repeating common pairs like "Cats vs. Dogs" or "Netflix vs. Disney+".
    Use ideas from pop culture, memes, tech, lifestyle, and philosophy.
    Only return the title.
    `
        ];
        const selectedPrompt = randomTitlePrompts[Math.floor(Math.random() * randomTitlePrompts.length)];
        payload.prompt = selectedPrompt;
      } else if (field === "statement") {
        payload.title = sanitizeInput(titleValue);
        const randomStatementPrompts = [
          `
  Generate a short, bold, and persuasive statement that strongly supports the side "${selectedSide}" in the debate titled "${sanitizeInput(titleValue)}".
  Make it punchy and passionate. No explanations, just the statement. Limit the statement to a maximum of 250 characters.
  `,
          `
  Write a confident and opinionated sentence that would spark a fun debate on the topic "${sanitizeInput(titleValue)}" from the perspective of side "${selectedSide}".
  Only return the statement. Limit the statement to a maximum of 250 characters.
  `,
          `
  Imagine you're trying to convince everyone that "${selectedSide}" is absolutely right in the clash titled "${sanitizeInput(titleValue)}".
  Generate one strong, tweet-sized statement that feels clever or provocative.
  Only return the statement. Limit the statement to a maximum of 250 characters.  
  `
        ];
        const selectedPrompt = randomStatementPrompts[Math.floor(Math.random() * randomStatementPrompts.length)];
        payload.prompt = selectedPrompt;
      }
      else if (field === "tags") {
        payload.title = sanitizeInput(titleValue);
        payload.statement = sanitizeInput(statement);
        const extractedKeywords = sanitizeInput(statement)
          .split(/\s+/)
          .filter(word => word.length > 4)
          .slice(0, 5)
          .join(", ");

        const contextAwarePrompt = `
Based on the title "${sanitizeInput(titleValue)}" and the following statement:
"${sanitizeInput(statement)}"

Identify up to 5 highly relevant, one-word tags that reflect key themes, topics, or emotions. Prioritize the following extracted keywords: ${extractedKeywords}.

Return only a comma-separated list of concise tags. No explanations.
`;
        payload.prompt = contextAwarePrompt;
      }

      const res = await fetch("/api/gpt/generate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch GPT response");
      }

      const data = await res.json();

      if (field === "title") {
        setTitleValue(data.generated);
        updateSideTitles(data.generated);
      } else if (field === "statement") {
        setStatement(data.generated);
      } else if (field === "tags") {
        const newTags = data.generated
          .split(",")
          .map(t => t.trim())
          .filter(t => t && !tags.includes(t) && t.length <= 20);
        setTags([...tags, ...newTags].slice(0, 5));
      }
    } catch (err) {
      console.error("GPT Generation Error:", err);
      alert(err.message || "Something went wrong while generating content.");
    } finally {
      setAiLoadingField(null);
    }
  };

  // Tag handlers
  const handleTagInputKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      
      if (!newTag || tags.includes(newTag)) {
        setTagInput("");
        return;
      }
      
      if (newTag.length > 20 || tags.length >= 5) return;
      
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
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
              <div className="text-subheading text-secondary font-semibold mb-1">{pendingClashData?.vs_title || titleValue}</div>
              <div className="text-body text-mutedDark mb-2">{pendingClashData?.vs_statement || statement}</div>
              <div className="flex flex-wrap gap-2">
                {(pendingClashData?.tags || tags).map(tag => (
                  <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white text-secondary border border-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-10 px-4 py-6" ref={formRef}>
        {/* Simple Form */}
        {!showDetailedForm && (
          <div className="relative group">
            <div className="relative bg-bgwhite rounded-3xl flex items-center px-4 py-2">
              <input
                type="text"
                placeholder="What's your VS today? (e.g. Xbox vs PlayStation)"
                className={`flex-grow bg-transparent border-none focus:outline-none text-caption text-secondary ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={titleValue ?? ""}
                onChange={handleTitleChange}
                onKeyPress={handleKeyPress}
                disabled={!isLoggedIn}
              />
              <div className="flex space-x-2 relative">
                {aiLoadingField === "title" ? (
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 transform text-caption text-mutedDark animate-pulse flex items-center gap-1 whitespace-nowrap pr-1">
                    <span>AI is generating</span><span className="text-caption">🤖</span>
                  </span>
                ) : (
                  <button
                    className={`text-mutedDark hover:text-secondary transition-colors ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => handleAIGenerate("title")}
                    disabled={!isLoggedIn}
                    title="Generate with AI"
                  >
                    ✨
                  </button>
                )}
                <button
                  className={`bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleStartNewClash}
                  disabled={!isLoggedIn}
                  title="Start a new VS clash"
                >
                  ⚔️
                </button>
              </div>
            </div>
            {!isLoggedIn && (
              <div className="absolute left-0 bottom-full mb-2 bg-secondary text-white text-caption px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-75 whitespace-nowrap">
                Sign in to create a clash
              </div>
            )}
          </div>
        )}

        {/* Detailed Form */}
        {showDetailedForm && (
          <div className="bg-white rounded-lg p-4 shadow-lg">
            {/* Form header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-body font-semibold text-secondary">Create New VS</h3>
              <button 
                className="text-mutedDark hover:text-alert"
                onClick={() => {
                  handleClearForm();
                  setShowDetailedForm(false);
                }}
              >
                ✕
              </button>
            </div>

            {/* VS title */}
            <div className="mb-4">
              <label htmlFor="title-vs-input" className={`block text-caption mb-1 transition-opacity duration-300 ${titleError ? 'text-alert animate-pulse' : 'text-mutedDark'}`}>
                {titleError ? "🎯 Let's name your epic clash first!" : "Title of VS"}
              </label>
              <div className="relative">
                <input
                  id="title-vs-input"
                  type="text"
                  placeholder="e.g. Xbox vs PlayStation"
                  className="w-full pr-10 px-3 py-2 bg-bgwhite rounded-3xl text-caption text-secondary border border-muted25 focus:outline-none"
                  value={titleValue ?? ""}
                  onChange={handleTitleChange}
                  onKeyPress={handleKeyPress}
                  maxLength={80}
                  minLength={10}
                  onDoubleClick={(e) => e.target.select()}
                />
                {aiLoadingField === "title" ? (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 transform text-caption text-mutedDark animate-pulse flex items-center gap-1 whitespace-nowrap pr-1">
                    <span>AI is generating</span><span className="text-caption">🤖</span>
                  </span>
                ) : (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-mutedDark hover:text-secondary transition-colors"
                    onClick={() => handleAIGenerate("title")}
                    type="button"
                    tabIndex={-1}
                    title="Generate with AI"
                  >
                    ✨
                  </button>
                )}
              </div>
              <p className={`text-caption opacity-75 mt-1 text-right ${titleValue.length > 70 ? 'text-accent' : titleValue.length < 10 ? 'text-accent' : 'text-mutedDark'}`}>
                {titleValue.length}/80
                {titleValue.length > 0 && titleValue.length < 10 && (
                  <span className="ml-2 text-accent opacity-75">Min. 10 characters</span>
                )}
              </p>
            </div>

            {/* Side selector buttons */}
            <div className="mb-4">
              <label className={`block text-caption mb-1 transition-opacity duration-300 ${showSideError ? 'text-alert animate-pulse' : 'text-mutedDark'}`}>
                {showSideError ? "⚔️ Choose your champion!" : "Pick your side"}
              </label>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleSideChange("A")}
                  title={fullSideATitle}
                  className={`pick-your-side-button flex-1 py-2 px-3 rounded-2xl text-caption border truncate ${
                    selectedSide === "A"
                      ? "border-accent bg-accent text-white"
                      : "border-accent text-secondary border-opacity-25 border-dashed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{sideATitle}</span>
                    {selectedSide === "A" && <span>✓</span>}
                  </div>
                </button>
                <button
                  onClick={() => handleSideChange("B")}
                  title={fullSideBTitle}
                  className={`pick-your-side-button flex-1 py-2 px-3 rounded-2xl text-caption border truncate ${
                    selectedSide === "B"
                      ? "border-accent bg-accent text-white"
                      : "border-accent text-secondary border-opacity-25 border-dashed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{sideBTitle}</span>
                    {selectedSide === "B" && <span>✓</span>}
                  </div>
                </button>
              </div>
            </div>

            {/* Statement input */}
            <div className="mb-4">
              <label htmlFor="statement-input" className={`block text-caption mb-1 transition-opacity duration-300 ${statementError ? 'text-alert animate-pulse' : 'text-mutedDark'}`}>
                {statementError
                  ? "💣 Make your bold claim loud and clear!"
                  : statementInfoMessage
                    ? statementInfoMessage
                    : "Statement"}
              </label>
              <div className="relative">
                <textarea
                  id="statement-input"
                  placeholder="Why do you think your side is better?"
                  className="w-full bg-bgwhite rounded-3xl text-caption text-secondary border border-muted25 focus:outline-none resize-y max-h-40 px-3 py-2 pr-10"
                  rows="2"
                  value={statement ?? ""}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  maxLength={250}
                  onDoubleClick={(e) => e.target.select()}
                ></textarea>
                {aiLoadingField === "statement" ? (
                  <span className="absolute right-2 top-2 text-caption text-mutedDark animate-pulse">
                    AI is generating 🤖
                  </span>
                ) : (
                  <button
                    className={`absolute right-2 top-2 text-mutedDark hover:text-secondary transition-colors ${!selectedSide ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => handleAIGenerate("statement")}
                    type="button"
                    tabIndex={-1}
                    title="Generate with AI"
                    disabled={!selectedSide}
                  >
                    ✨
                  </button>
                )}
              </div>
              <p className={`text-caption opacity-75 mt-1 text-right ${statement.length > 230 ? 'text-accent' : statement.length < 25 ? 'text-accent' : 'text-mutedDark'}`}>
                {statement.length}/250
                {statement.length > 0 && statement.length < 25 && (
                  <span className="ml-2 text-accent opacity-75">Min. 25 characters</span>
                )}
              </p>
            </div>

            {/* Tags input */}
            <div className="mb-4">
              <label htmlFor="tags-input" className="block text-caption text-mutedDark mb-1">
                Tags (optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted25 text-mutedDark">
                    {tag}
                    <button 
                      className="ml-1 text-mutedDark hover:text-alert"
                      onClick={() => handleTagRemove(tag)}
                      type="button"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <input
                  id="tags-input"
                  type="text"
                  placeholder="Add tags separated by comma or Enter"
                  className="w-full bg-bgwhite rounded-3xl text-caption text-secondary border border-muted focus:outline-none px-3 py-2 pr-10"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  maxLength={100}
                  onDoubleClick={(e) => e.target.select()}
                />
                {aiLoadingField === "tags" ? (
                  <span className="absolute right-2 top-2 text-xs text-mutedDark animate-pulse">
                    AI is generating 🤖
                  </span>
                ) : (
                  <button
                    className={`absolute right-2 top-2 text-mutedDark hover:text-secondary transition-colors ${!selectedSide ? 'opacity-50 cursor-not-allowed' : ''}`}
                    type="button"
                    onClick={() => handleAIGenerate("tags")}
                    tabIndex={-1}
                    title="Generate with AI"
                    disabled={!selectedSide}
                  >
                    ✨
                  </button>
                )}
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <button
                className={`px-6 py-4 bg-accent text-bgashwhite text-label rounded-2xl ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'}`}
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
    </>
  );
};

export default ClashForm; 