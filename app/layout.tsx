import Navbar from "./components/Navbar"; // Change to "./components/Navbar" if you get a red line
import "./globals.css";

export const metadata = {
  title: "FoodCompare",
  description: "Find the best delivery deals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}