import React from 'react'

export interface LogoProps {
  className?: string
  variant?: 'full' | 'mark'
}

export const Logo: React.FC<LogoProps> = ({
  className = 'h-8 w-auto',
  variant = 'full',
}) => {
  if (variant === 'mark') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        aria-label="Muttley"
      >
        <rect x="2" y="2" width="28" height="28" rx="4" fill="#8b2e19" />
        <path
          d="M9 21V10L16 16.5L23 10V21M9 21H12M20 21H23"
          stroke="#FCF9F5"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="7" r="1.5" fill="#FCF9F5" />
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 40"
      fill="none"
      className={className}
      aria-label="Muttley acadêmico"
    >
      <rect x="2" y="6" width="28" height="28" rx="4" fill="#8b2e19" />
      <path
        d="M9 25V14L16 20.5L23 14V25M9 25H12M20 25H23"
        stroke="#FCF9F5"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="11" r="1.5" fill="#FCF9F5" />
      <text
        x="38"
        y="26"
        fontFamily="'Newsreader', Georgia, serif"
        fontSize="22"
        fontWeight="700"
        fill="#1c1c1a"
        letterSpacing="-0.5"
      >
        Muttley
      </text>
      <text
        x="114"
        y="19"
        fontFamily="'Newsreader', Georgia, serif"
        fontSize="9"
        fontStyle="italic"
        fontWeight="500"
        fill="#8b2e19"
      >
        acadêmico
      </text>
    </svg>
  )
}
