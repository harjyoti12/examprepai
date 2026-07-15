const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

const PORTFOLIO_URL = "https://jyotiversedev.vercel.app";
const LINKEDIN_URL = "https://www.linkedin.com/in/harjyoti-kalita-75a702363";
const X_URL = "https://x.com/herogaming7358";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${baseUrl}/#organization`,
  name: "ExamPrepAI",
  url: baseUrl,
  logo: {
    "@type": "ImageObject",
    url: `${baseUrl}/favicon.svg`,
  },
  description:
    "AI-powered study assistant that transforms your class notes into exam-ready questions, short answers, and revision notes.",
  sameAs: [PORTFOLIO_URL, LINKEDIN_URL, X_URL],
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${baseUrl}/#website`,
  name: "ExamPrepAI",
  url: baseUrl,
  description:
    "Upload your class notes and let AI generate important questions, short answers, and revision notes instantly. Free to start.",
  inLanguage: "en-US",
  publisher: {
    "@id": `${baseUrl}/#organization`,
  },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ExamPrepAI",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  url: baseUrl,
  description:
    "AI-powered study assistant that uploads your class notes (PDF & images) and generates important questions, short answers, and quick revision notes for exam preparation.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan with 30 AI credits per month",
  },
  featureList: [
    "Upload PDF class notes",
    "Upload image class notes",
    "AI-generated important questions",
    "AI-generated short answers",
    "AI-generated revision notes",
    "Credit-based free usage",
  ],
  publisher: {
    "@id": `${baseUrl}/#organization`,
  },
};

export function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
    </>
  );
}
