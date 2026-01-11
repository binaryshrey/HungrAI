import HeroSection from "./HeroSection";
import Features from "./Features";
import CTA from "./CTA";
import Footer from "./Footer";
import {
  withAuth,
  getSignInUrl,
  getSignUpUrl,
} from "@workos-inc/authkit-nextjs";

export default async function Home() {
  const { user } = await withAuth();
  const signInUrl = await getSignInUrl();
  const signUpUrl = await getSignUpUrl();
  return (
    <>
      <HeroSection user={user} signInUrl={signInUrl} signUpUrl={signUpUrl} />
      <Features />
      <CTA signInUrl={signInUrl} />
      <Footer />
    </>
  );
}
