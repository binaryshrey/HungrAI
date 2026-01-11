"use client";

import Link from "next/link";
import {
  GitHubLogoIcon,
  GlobeIcon,
  LinkedInLogoIcon,
} from "@radix-ui/react-icons";
import {
  GITHUB_URI,
  LINKEDIN_URI,
  BETTERSTACK_URI,
  HUNGRAI_URI,
} from "../../utils/Constants";

const Footer = () => {
  return (
    <footer className="bg-green-700 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Navigation Links */}
        <nav className="flex justify-center gap-8 mb-8">
          <Link
            href={GITHUB_URI}
            target="_blank"
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Github
          </Link>
          <Link
            href={BETTERSTACK_URI}
            target="_blank"
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Status
          </Link>
          <Link
            href="/#features"
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Features
          </Link>
          <Link
            href={LINKEDIN_URI}
            target="_blank"
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mb-8">
          <Link
            href={GITHUB_URI}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <GitHubLogoIcon className="w-6 h-6" />
          </Link>
          <Link
            href={HUNGRAI_URI}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Website"
          >
            <GlobeIcon className="w-6 h-6" />
          </Link>
          <Link
            href={LINKEDIN_URI}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors"
            aria-label="LinkedIn"
          >
            <LinkedInLogoIcon className="w-6 h-6" />
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-white/60 text-sm">© 2025 HungrAI.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
