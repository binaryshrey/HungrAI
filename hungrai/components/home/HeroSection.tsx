"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const logo = "/logo.svg";

interface HeroSectionProps {
  user?: any;
  signInUrl?: string;
  signUpUrl?: string;
}

export default function HeroSection({
  user,
  signInUrl,
  signUpUrl,
}: HeroSectionProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);

  const handleGetStarted = () => {
    setLoadingButton(true);
    setTimeout(() => {
      setLoadingButton(false);
      if (signInUrl) {
        window.location.href = signInUrl;
      }
    }, 800);
  };

  return (
    <div className="relative isolate overflow-hidden bg-[#000000] text-white">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <svg
          className="relative left-[calc(50%-11rem)] -z-10 h-84.75 max-w-none -translate-x-1/2 rotate-30 sm:left-[calc(50%-30rem)] sm:h-169.5"
          viewBox="0 0 1155 678"
        >
          <path
            fill="url(#9b2541ea-d39d-499b-bd42-aeea3e93f5ff)"
            fillOpacity=".3"
            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
          />
          <defs>
            <linearGradient
              id="9b2541ea-d39d-499b-bd42-aeea3e93f5ff"
              x1="1155.49"
              x2="-78.208"
              y1=".177"
              y2="474.645"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#9089FC" />
              <stop offset={1} stopColor="#FF80B5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* decorative svgs omitted for brevity (kept layout classes) */}
      <div className="px-6 pt-6 lg:px-8">
        <nav className="flex items-center justify-between" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5 flex items-center">
              <img className="h-4" src={logo} alt="" />
              <h4 className="ml-2 text-white sm:text-2xl">HungrAI</h4>
            </a>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="hidden lg:flex lg:gap-x-12">
            <a
              href="https://github.com/binaryshrey/HungrAI"
              className="text-sm font-semibold leading-6 text-white"
            >
              Github
            </a>
            <a
              href="/collections"
              className="text-sm font-semibold leading-6 text-white cursor-pointer"
            >
              Collections
            </a>
            <a
              href="https://in.linkedin.com/in/shreyanshsaurabh"
              className="text-sm font-semibold leading-6 text-white"
            >
              Contact
            </a>
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link
              href={signInUrl ? signInUrl : "/"}
              className="text-sm font-semibold leading-6 text-white"
            >
              Log in
            </Link>
          </div>
        </nav>

        <Dialog as="div" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <Dialog.Panel className="fixed inset-0 z-10 overflow-y-auto bg-white px-6 py-6 lg:hidden">
            <div className="flex items-center justify-between">
              <a href="/" className="-m-1.5 p-1.5">
                <img className="h-8" src={logo} alt="" />
              </a>
              <h4 className="ml-2 text-gray-900 sm:text-2xl">HungrAI</h4>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <a
                    href="https://github.com/binaryshrey/HungrAI"
                    className="-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-400/10"
                  >
                    Github
                  </a>
                  <a
                    href="/collections"
                    className="-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-400/10 cursor-pointer"
                  >
                    Collections
                  </a>
                  <a
                    href="https://in.linkedin.com/in/shreyanshsaurabh"
                    className="-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-400/10"
                  >
                    Contact
                  </a>
                </div>

                <div className="py-6">
                  <Link
                    href="/login"
                    className="-mx-3 block rounded-lg py-2.5 px-3 text-base font-semibold leading-6 text-gray-900 hover:bg-gray-400/10"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </div>

      {/* Hero Section Content */}
      <div className="relative mx-auto max-w-7xl px-8 py-24 lg:py-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left content */}
          <div className="space-y-8 mt-2">
            <Badge
              variant="secondary"
              className="w-fit rounded-full bg-gray-100/20 px-4 py-1 text-sm text-white/90 backdrop-blur-xl border border-white/40 shadow-lg"
            >
              Introducing Hungr AI v1.0
            </Badge>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-4xl -mt-2">
              Scan Your Fridge. <br />
              Discover New Recipes Everyday!
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              HungrAI takes the uncertainty out of meal planning. Scan your food
              items to get AI-powered recipe recommendations, discover missing
              ingredients and order them instantly from Instacart.
            </p>

            <div className="flex items-center gap-6">
              {loadingButton && (
                <Button
                  className="cursor-pointer bg-white text-black hover:bg-white"
                  disabled
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Get Started
                </Button>
              )}
              {!loadingButton && (
                <Button
                  className="cursor-pointer bg-white text-black hover:bg-white"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
              )}

              <Link
                href="https://github.com/binaryshrey/HungrAI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white"
              >
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative rounded-[2.5rem] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
              <div className="relative overflow-hidden rounded-[2rem]">
                <Image
                  src="/mobile.webp"
                  alt="App preview"
                  width={310}
                  height={620}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
