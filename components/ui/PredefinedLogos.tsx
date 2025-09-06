import React from 'react';

// Using more professional, abstract and architectural icons.
// These are just the path/shape elements. Styling is applied in LogoDisplay.
export const predefinedLogos: { [key: string]: JSX.Element } = {
  logo1: <path strokeLinecap="round" strokeLinejoin="round" d="M4 36V12L20 4l16 8v24H4z M16 36V20h8v16" />,
  logo2: <g transform="translate(2 2)"><circle cx="12" cy="12" r="10" /><circle cx="22" cy="22" r="10" /></g>,
  logo3: <path strokeLinecap="round" strokeLinejoin="round" d="M20 4C10 10 10 30 20 36S30 30 30 10S10 10 20 4z M20 4v32" />,
  logo4: <path strokeLinecap="round" strokeLinejoin="round" d="M4 20L20 4l16 16v16H4z M18 24h4v12h-4z" />,
  logo5: <g transform="translate(4 4)"><circle cx="10" cy="10" r="6" /><path d="M14 14l12 12m-4-1h5v-5" /></g>,
  logo6: <path strokeLinecap="round" strokeLinejoin="round" d="M20 4 C20 4 36 8 36 20 C 36 32 20 36 20 36 C 20 36 4 32 4 20 C 4 8 20 4 20 4Z" />,
  logo7: <g><circle cx="20" cy="20" r="6"/><path d="M20 4V8m0 24v-4m12-8h-4M8 20H4m11.17-7.17l-2.83 2.83M8.83 28.34l-2.83-2.83m0-11.34l2.83 2.83m11.34 11.34l-2.83-2.83"/></g>,
  logo8: <path strokeLinecap="round" strokeLinejoin="round" d="M4 16s8-8 16-8 16 8 16 8-8 8-16 8-16-8-16-8z M4 24s8-8 16-8 16 8 16 8" />,
  logo9: <path strokeLinecap="round" strokeLinejoin="round" d="M8 36V12h6v24z M18 36V8h6v28z M28 36V16h6v20z" />,
  logo10: <path strokeLinecap="round" strokeLinejoin="round" d="M20 4L36 20 20 36 4 20z M20 4v32 M4 20h32" />,
};

export const LogoDisplay: React.FC<{ logoKey: string, className?: string }> = ({ logoKey, className }) => {
    const logoSvg = predefinedLogos[logoKey];
    if (!logoSvg) return null;

    // Apply consistent styling to all logos
    return (
        <svg
            viewBox="0 0 40 40"
            className={className || 'w-10 h-10'}
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
        >
            {logoSvg}
        </svg>
    );
};
