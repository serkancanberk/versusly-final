import React from "react";

export default function ClashArgumentsDisplay({ Clash_arguments = [] }) {
  return (
    <button className="flex items-center justify-center gap-1 text-caption text-secondary hover:text-mutedDark hover:scale-105 transition-transform hover:bg-muted25 rounded-md py-4 w-full">
      {Clash_arguments.length === 0 ? (
        <>
          <span>🤺</span>
          <span>- No arguments yet.</span>
        </>
      ) : (
        <>
          <span>🤺</span>
          <span>
            Args ({Clash_arguments.length}) - {Clash_arguments[Clash_arguments.length - 1]?.text?.slice(0, 15)}...
          </span>
        </>
      )}
    </button>
  );
}