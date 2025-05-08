import React, { useState, useEffect } from 'react';
import { FaUser, FaThumbsUp, FaComment, FaTag, FaLink, FaFlag, FaClock } from 'react-icons/fa';

export default function ClashDetails({ clashId }) {
  const [clash, setClash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSide, setSelectedSide] = useState(null);
  const [argumentText, setArgumentText] = useState('');
  const isGuest = false; // Temporary placeholder; later can be based on user context or props

  useEffect(() => {
    // Only fetch if we have a clashId
    if (!clashId) {
      setLoading(false);
      return;
    }

    const fetchClash = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/clashes/${clashId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setClash(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch clash details');
      } finally {
        setLoading(false);
      }
    };

    fetchClash();

    // Cleanup function
    return () => {
      setClash(null);
      setError(null);
    };
  }, [clashId]); // Only re-run if clashId changes

  const handleSubmitArgument = async () => {
    if (!selectedSide || !argumentText.trim()) {
      alert("Please select a side and write your argument.");
      return;
    }

    try {
      const response = await fetch(`/api/clashes/${clashId}/arguments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          side: selectedSide,
          content: argumentText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit argument");
      }

      const newArgument = await response.json();

      // Optimistically update local clash state
      setClash((prev) => ({
        ...prev,
        arguments: [newArgument, ...(prev.arguments || [])],
      }));

      setArgumentText("");
      setSelectedSide(null);
    } catch (err) {
      alert(err.message || "An error occurred while submitting your argument.");
    }
  };

  if (!clashId) {
    return <div className="p-4 text-secondary">No clash selected</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-alert">
        <p>Error loading clash: {error}</p>
      </div>
    );
  }

  if (!clash) {
    return (
      <div className="p-4 text-secondary">
        Clash not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="w-full h-[30vh] bg-gradient-to-r from-blue-500 to-purple-600 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white text-center px-4">
            {clash.vs_title}
          </h1>
        </div>
      </div>

      {/* Meta Info Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Left Side - Creator Info */}
            <div className="flex items-center space-x-4">
              <img
                src={clash.creator.avatar}
                alt={clash.creator.username}
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
              />
              <div>
                <p className="font-semibold">{clash.creator.username}</p>
                <p className="text-sm text-gray-500">{clash.creator.timestamp}</p>
              </div>
            </div>

            {/* Right Side - Action Items */}
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <FaThumbsUp />
                <span>{clash.reactions || 0}</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <FaComment />
                <span>{clash.arguments?.length || 0}</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <FaLink />
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                <FaFlag />
              </button>
              <div className="flex items-center space-x-2 text-gray-600">
                <FaClock />
                <span>12h 23m left</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Clash Content Body */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-4">{clash.vs_title}</h2>
            <p className="text-lg text-gray-600 mb-6">{clash.vs_statement}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {clash.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm flex items-center"
                >
                  <FaTag className="mr-2" /> {tag}
                </span>
              ))}
            </div>

            {/* Voting Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex justify-between mb-2 text-sm font-medium">
                <span>Side A ({clash?.voteDistribution?.sideA ?? 0}%)</span>
                <span>Neutral ({clash?.voteDistribution?.neutral ?? 0}%)</span>
                <span>Side B ({clash?.voteDistribution?.sideB ?? 0}%)</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="flex h-full">
                  <div
                    className="bg-blue-500 transition-all duration-300"
                    style={{ width: `${clash?.voteDistribution?.sideA ?? 0}%` }}
                  />
                  <div
                    className="bg-gray-400 transition-all duration-300"
                    style={{ width: `${clash?.voteDistribution?.neutral ?? 0}%` }}
                  />
                  <div
                    className="bg-red-500 transition-all duration-300"
                    style={{ width: `${clash?.voteDistribution?.sideB ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Drop Your Take Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-10 max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold mb-6">Drop Your Take</h3>
            <div className="flex gap-6 mb-8">
              <button
                onClick={() => setSelectedSide('A')}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                  selectedSide === 'A'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Side A
              </button>
              <button
                onClick={() => setSelectedSide('neutral')}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300 ${
                  selectedSide === 'neutral'
                    ? 'bg-gray-600 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Neutral
              </button>
              <button
                onClick={() => setSelectedSide('B')}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-red-300 ${
                  selectedSide === 'B'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                Side B
              </button>
            </div>
            <textarea
              value={argumentText}
              onChange={(e) => setArgumentText(e.target.value)}
              placeholder="Write your argument here..."
              className="w-full min-h-[140px] p-5 border border-gray-300 rounded-xl mb-6 resize-none focus:ring-4 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-lg"
            />
            <button
              onClick={handleSubmitArgument}
              className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors duration-300 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-blue-400"
            >
              Add Argument
            </button>
          </div>

          {/* Arguments List */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Arguments</h3>
            {clash.arguments.length > 0 ? (
              <div className="space-y-4">
                {clash.arguments.map((argument) => (
                  <div
                    key={argument.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={argument.authorAvatar || "https://via.placeholder.com/40"}
                          alt={argument.author}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{argument.author}</p>
                          <p className="text-sm text-gray-500">{argument.timestamp}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{argument.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No arguments yet. Be the first to share your thoughts!</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  Add First Argument
                </button>
              </div>
            )}
          </div>

          {/* Similar Clashes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Related Clashes</h3>
            <div className="space-y-4">
              {Array.isArray(clash.similarClashes) && clash.similarClashes.map((similarClash) => (
                <div
                  key={similarClash.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  <h4 className="font-semibold mb-2">{similarClash.vs_title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{similarClash.vs_statement}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="flex items-center mr-4">
                      <FaThumbsUp className="mr-1" /> {similarClash.reactions || 0}
                    </span>
                    <span className="flex items-center">
                      <FaComment className="mr-1" /> {similarClash.arguments?.length || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 