/** Project creator details, shared by the About page and the footer. */
export const CREATOR = {
  name: "Lochan P Anchalkar",
  email: "lochanap2005@gmail.com",
  github: { url: "https://github.com/lochan-22", handle: "lochan-22" },
  linkedin: { url: "https://linkedin.com/in/lochan-p-anchalkar-6b70b02a6" },
} as const;

export const CREATOR_MAILTO = `mailto:${CREATOR.email}?subject=${encodeURIComponent("ShopMind AI")}`;
