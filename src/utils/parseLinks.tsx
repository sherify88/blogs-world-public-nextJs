import React from "react";

export const parseLinks = (content: string): React.ReactNode => {
  const urlRegex = /https?:\/\/[^\s]+/g;

  // Split the content into parts
  const parts = content.split(urlRegex);
  const matches = content.match(urlRegex) || [];

  // Combine the parts and matches into a React fragment
  return parts.reduce((acc, part, index) => {
    acc.push(<span key={`text-${index}`}>{part}</span>);
    if (matches[index]) {
      acc.push(
        <a
          key={`link-${index}`}
          href={matches[index]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-words"
        >
          {matches[index]}
        </a>
      );
    }
    return acc;
  }, [] as React.ReactNode[]);
};
