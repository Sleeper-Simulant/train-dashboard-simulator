/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                aramis: {
                    bg: '#1a1a1a',
                    panel: '#2d2d2d',
                    accent: '#00a8e8',
                    text: '#e0e0e0',
                    success: '#4caf50',
                    warning: '#ff9800',
                    danger: '#f44336'
                }
            }
        },
    },
    plugins: [],
}
