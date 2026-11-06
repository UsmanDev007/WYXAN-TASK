/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#16212C",
          soft: "#41505E",
          faint: "#7A8894",
        },
        paper: "#F1F4F3",
        card: "#FBFCFC",
        line: {
          DEFAULT: "#D3DBD8",
          soft: "#E3E8E6",
        },
        start: {
          DEFAULT: "#E08A34",
          tint: "#FBEFDF",
        },
        active: {
          DEFAULT: "#2E7BD6",
          tint: "#E7F0FB",
        },
        done: {
          DEFAULT: "#2F9160",
          tint: "#E4F3EB",
        },
        alert: {
          DEFAULT: "#C4453D",
          tint: "#FAE8E7",
        },
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
