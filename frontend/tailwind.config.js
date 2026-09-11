/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx}",
        "./components/**/*.{js,jsx}",
        "./lib/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#020617", // slate-950
                card: "#0f172a",       // slate-900
                border: "#1e293b",     // slate-800
                primary: {
                    DEFAULT: "#06b6d4",  // cyan-500
                    hover: "#0891b2",    // cyan-600
                },
                secondary: {
                    DEFAULT: "#8b5cf6",  // violet-500
                    hover: "#7c3aed",    // violet-600
                },
            },
        },
    },
    plugins: [],
};