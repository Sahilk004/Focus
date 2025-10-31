import React from "react";

function Svg({ children, size = 24, className = "", stroke = 2 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={stroke}
      stroke="currentColor"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function Icon({ name, size = 24, className = "", stroke = 2 }) {
  switch (name) {
    case "upload":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 16.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5" />
        </Svg>
      );
    case "file":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 3v6h6" />
        </Svg>
      );
    case "file-pdf":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 9h3a2 2 0 0 1 0 4H8zM14 9h2a0.5 0.5 0 0 1 .5.5V11M14 13h2" strokeLinecap="round" />
        </Svg>
      );
    case "file-ppt":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 9h3a2 2 0 1 1 0 4H8zM14 9h2M14 13h2" strokeLinecap="round" />
        </Svg>
      );
    case "x":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
        </Svg>
      );
    case "arrow-right":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
        </Svg>
      );
    case "warning":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </Svg>
      );
    case "copy":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <rect x="9" y="9" width="10" height="10" rx="2" />
          <rect x="5" y="5" width="10" height="10" rx="2" />
        </Svg>
      );
    case "download":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16" />
        </Svg>
      );
    case "record-dot":
      return (
        <Svg size={size} className={className} stroke={0}>
          <circle cx="12" cy="12" r="6" fill="currentColor" />
        </Svg>
      );
    case "stop":
      return (
        <Svg size={size} className={className} stroke={0}>
          <rect x="7" y="7" width="10" height="10" fill="currentColor" rx="2" />
        </Svg>
      );
    case "clock":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M12 7v6l4 2" />
        </Svg>
      );
    case "video":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <rect x="3" y="7" width="13" height="10" rx="2" />
          <path d="M16 10l5-3v10l-5-3z" />
        </Svg>
      );
    case "music":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V6l9-2v12" />
          <circle cx="9" cy="18" r="2" />
          <circle cx="18" cy="16" r="2" />
        </Svg>
      );
    case "send":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l16-8-7 16-2-6-7-2z" />
        </Svg>
      );
    case "check-circle":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l3 3 5-6" />
        </Svg>
      );
    case "user":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5z" />
          <circle cx="12" cy="7" r="4" />
        </Svg>
      );
    case "bot":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <rect x="5" y="6" width="14" height="12" rx="3" />
          <circle cx="9" cy="12" r="1" />
          <circle cx="15" cy="12" r="1" />
          <path d="M12 6V3" strokeLinecap="round" />
        </Svg>
      );
    case "message-circle":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a8 8 0 0 1-8 8H9l-4 3v-5a8 8 0 1 1 16-6z" />
        </Svg>
      );
    case "calendar":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 9h18" strokeLinecap="round" />
        </Svg>
      );
    case "eye":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </Svg>
      );
    case "eye-off":
      return (
        <Svg size={size} className={className} stroke={stroke}>
          <path d="M3 3l18 18" strokeLinecap="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 3-3 2.99 2.99 0 0 0-.59-1.76M7.7 7.7C5.1 8.9 3 12 3 12s4 7 9 7c1.46 0 2.8-.36 4-.99" />
        </Svg>
      );
    default:
      return null;
  }
}

export default Icon;