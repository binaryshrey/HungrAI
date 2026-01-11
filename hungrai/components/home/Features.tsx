"use client";
import { CircleCheckBig } from "lucide-react";

const features = [
  {
    name: "Food Recognition",
    description:
      "Scan and identify any dish instantly with Google Gemini image recognition.",
    icon: CircleCheckBig,
  },
  {
    name: "Recipe Discovery",
    description:
      "Get personalized recipe suggestions based on your scanned food and preferences.",
    icon: CircleCheckBig,
  },
  {
    name: "Save Favorites",
    description:
      "Keep track of your favorite meals and recipes for quick access anytime.",
    icon: CircleCheckBig,
  },
  {
    name: "Smart Meal Planning",
    description:
      "Plan your meals efficiently with AI-generated suggestions tailored to your diet.",
    icon: CircleCheckBig,
  },
  {
    name: "Nutrition Insights",
    description:
      "Track nutritional information and get insights into your eating habits over time.",
    icon: CircleCheckBig,
  },
  {
    name: "Privacy First",
    description:
      "Your food preferences and data are protected with enterprise-grade security.",
    icon: CircleCheckBig,
  },
];

export default function Features() {
  return (
    <div className="bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-xl font-semibold leading-8 tracking-tight text-green-700">
            Add trackable meals easily from anywhere in HungrAI.
          </h2>
          <p className="mt-6 text-md leading-8 text-gray-400">
            HungrAI makes meal planning easy. Scan your ingredients, <br /> get
            personalized recipe ideas, spot missing items and have them
            delivered instantly.
          </p>
        </div>
      </div>
      <div className="relative overflow-hidden pt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <img
            src="./features.webp"
            alt="App screenshot"
            className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
            width={2432}
            height={1442}
          />
          <div className="relative" aria-hidden="true">
            <div className="absolute -inset-x-20 bottom-0 bg-linear-to-t from-black/10 pt-[7%]" />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
        <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-400 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
          {features.map((feature) => (
            <div key={feature.name} className="relative pl-9">
              <dt className="inline font-semibold text-white">
                <feature.icon
                  className="absolute top-1 left-1 h-5 w-5 text-green-700"
                  aria-hidden="true"
                />
                {feature.name}
              </dt>{" "}
              <dd className="inline">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
