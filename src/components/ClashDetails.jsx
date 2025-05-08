import React, { useState, useEffect } from 'react';
import { FaUser, FaThumbsUp, FaComment, FaTag } from 'react-icons/fa';

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
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:w-2/3">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={clash.creator.avatar}
                    alt={clash.creator.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{clash.creator.username}</p>
                    <p className="text-sm text-gray-500">{clash.creator.timestamp}</p>
                  </div>
                </div>
              </div>
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold mb-2">{clash.vs_title}</h1>
                <p className="text-lg text-gray-600">{clash.vs_statement}</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {clash.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    <FaTag className="mr-1" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Voting Bar */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Side A ({clash?.voteDistribution?.sideA ?? 0}%)</span>
                <span className="text-sm font-medium">Neutral ({clash?.voteDistribution?.neutral ?? 0}%)</span>
                <span className="text-sm font-medium">Side B ({clash?.voteDistribution?.sideB ?? 0}%)</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="flex h-full">
                  <div
                    className="bg-blue-500"
                    style={{ width: `${clash?.voteDistribution?.sideA ?? 0}%` }}
                  />
                  <div
                    className="bg-gray-400"
                    style={{ width: `${clash?.voteDistribution?.neutral ?? 0}%` }}
                  />
                  <div
                    className="bg-red-500"
                    style={{ width: `${clash?.voteDistribution?.sideB ?? 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Add Argument Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Drop Your Take</h2>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setSelectedSide('A')}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    selectedSide === 'A'
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  Side A
                </button>
                <button
                  onClick={() => setSelectedSide('neutral')}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    selectedSide === 'neutral'
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Neutral
                </button>
                <button
                  onClick={() => setSelectedSide('B')}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    selectedSide === 'B'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  Side B
                </button>
              </div>
              <textarea
                value={argumentText}
                onChange={(e) => setArgumentText(e.target.value)}
                placeholder="Write your argument here..."
                className="w-full h-32 p-3 border rounded-lg mb-4"
              />
              <button
                onClick={handleSubmitArgument}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Add Argument
              </button>
            </div>

            {/* Arguments Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Arguments</h2>
              {clash.arguments.length > 0 ? (
                <div className="space-y-4">
                  {clash.arguments.map((argument) => (
                    <div
                      key={argument.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FaUser className="text-gray-500" />
                          <span className="font-medium">{argument.author}</span>
                        </div>
                        <span className="text-sm text-gray-500">{argument.timestamp}</span>
                      </div>
                      <p className="text-gray-700">{argument.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No arguments yet. Be the first to share your thoughts!</p>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Add First Argument
                  </button>
                </div>
              )}
            </div>

            {/* Similar Clashes Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Similar Clashes</h2>
              <div className="space-y-4">
                {Array.isArray(clash.similarClashes) && clash.similarClashes.map((clash) => (
                  <div
                    key={clash.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <h3 className="font-semibold mb-1">{clash.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{clash.statement}</p>
                    <p className="text-sm text-gray-500">{clash.preview}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-1/3">
            {isGuest ? (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Join the Debate</h2>
                <p className="text-gray-600 mb-4">
                  Sign in to participate in discussions and share your thoughts.
                </p>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg mb-3 hover:bg-blue-700">
                  Sign In
                </button>
                <button className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200">
                  Create Account
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src="https://via.placeholder.com/60"
                    alt="User Avatar"
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">Username</h3>
                    <p className="text-sm text-gray-500">Member since 2024</p>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg mb-4 hover:bg-blue-700">
                  Create New Clash
                </button>
              </div>
            )}

            {/* Trending Clashes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Trending Clashes</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <h3 className="font-semibold mb-1">Trending Clash {item}</h3>
                    <p className="text-sm text-gray-600">
                      This is a sample trending clash description...
                    </p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="flex items-center mr-4">
                        <FaThumbsUp className="mr-1" /> 123
                      </span>
                      <span className="flex items-center">
                        <FaComment className="mr-1" /> 45
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 