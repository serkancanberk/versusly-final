/**
 * Extracts side labels from a vs_title string
 * @param {string} title - The vs_title string to parse
 * @returns {{sideA: string, sideB: string}} Object containing the extracted side labels
 */
export const extractSideLabelsFromTitle = (title) => {
  if (!title || title.trim() === "") {
    return { sideA: "Side A", sideB: "Side B" };
  }

  const formatSideTitle = (title) => {
    return title.trim();
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

  const dividers = [
    ' vs ', ' vs. ', ' - ', ' or ', ' karşı ', ' against ',
    ' veya ', ' mi yoksa ', ' versus ', ' vs ', ' vs. ',
    ' versus ', ' against ', ' versus ', ' vs ', ' vs. '
  ];
  
  for (const divider of dividers) {
    if (title.toLowerCase().includes(divider)) {
      const parts = title.split(divider);
      if (parts.length >= 2) {
        const rawA = parts[0].trim();
        const rawB = parts[1].trim();
        
        const cleanA = rawA.replace(/['"]/g, '').replace(/[.,;:!?]$/, '');
        const cleanB = rawB.replace(/['"]/g, '').replace(/[.,;:!?]$/, '');
        
        return {
          sideA: formatSideTitle(cleanA),
          sideB: formatSideTitle(cleanB)
        };
      }
    }
  }
  
  if (title.includes("tercih ederim")) {
    const parts = title.split("tercih ederim");
    if (parts.length > 0) {
      const preferParts = parts[0].split("'");
      if (preferParts.length >= 3) {
        const rawA = preferParts[0].trim();
        const rawB = preferParts[2].trim()
          .replace(/ye$/, '')
          .replace(/ya$/, '')
          .replace(/ye$/, '')
          .replace(/ya$/, '');
        
        return {
          sideA: formatSideTitle(rawA),
          sideB: formatSideTitle(rawB)
        };
      }
    }
  }
  
  // Fallback to extracting meaningful parts
  const { sideA, sideB } = extractMeaningfulParts(title);
  return {
    sideA: formatSideTitle(sideA),
    sideB: formatSideTitle(sideB)
  };
}; 