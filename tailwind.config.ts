import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",

        // hapus atau sesuaikan path di atas kalau lo ga pake folder src/
    ],
    theme: {
        extend: {
            colors: {
                'steal-gray': '#272343',
            },
        },
    },
    plugins: [],
};

export default config;