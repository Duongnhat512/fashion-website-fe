import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white text-center py-6 mt-10">
      <p>© {new Date().getFullYear()} BOOBOO. All rights reserved.</p>
      <div className="flex justify-center gap-4 mt-3 text-sm">
        <a href="#">Facebook</a>
        <a href="#">Instagram</a>
        <a href="#">Twitter</a>
      </div>
    </footer>
  );
}
