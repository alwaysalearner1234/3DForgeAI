import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
    title: "3DForge AI — Production-Ready 3D Asset Generation",
    description: "Transform natural text prompts and reference images into production-ready 3D assets.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="dark">
            <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
                <Navbar />
                <main className="flex-1 flex flex-col">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}