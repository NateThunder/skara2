export type TheBandContent = {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  imageSrc: string;
  imageAlt: string;
};

export type ServicesContent = {
  eyebrow: string;
  heading: string;
  subtitle: string;
  ceilidhs: {
    intro: string;
    events: string[];
    teaching: string;
    dances: string[];
  };
  backgroundMusic: {
    intro: string;
    events: string[];
  };
  djDisco: {
    intro: string;
    details: string;
    weddingFormatTitle: string;
    weddingFormat: string[];
  };
  bagpiper: {
    intro: string;
    options: string[];
  };
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string[];
};

export type Review = {
  id: string;
  quote: string[];
  author: string;
};

export type ContactContent = {
  eyebrow: string;
  heading: string;
  subtitle: string;
};

export type MediaContent = {
  eyebrow: string;
  heading: string;
  subtitle: string;
};

export type HomepageContent = {
  theBand: TheBandContent;
  media: MediaContent;
  services: ServicesContent;
  faqs: FaqItem[];
  reviews: Review[];
  contact: ContactContent;
};

export const homepageContent: HomepageContent = {
  theBand: {
    eyebrow: "The Band",
    heading: "High-energy ceilidh music with authentic Scottish roots.",
    paragraphs: [
      "Skara Ceilidh Band is a high-energy ceilidh band based in Scotland. This dynamic four-piece line-up of fiddle, pipes, guitar and drums delivers an authentic, lively, and professional performance at every event.",
      "Perfect for weddings, parties, corporate events, and festivals, Skara creates an unforgettable ceilidh experience for audiences of all ages and abilities across Scotland and worldwide.",
      "Individually, the band members tour internationally with leading artists including Nathan Evans & Saint PHNX, Skipinnish, and Norrie MacIver, and the line-up features finalists from the prestigious BBC Radio Scotland Young Traditional Musician of the Year.",
      "Blending traditional Scottish tunes with a powerful modern rhythm section, Skara's energetic live sound creates a vibrant dance-floor atmosphere and a truly memorable night.",
    ],
    imageSrc: "/88137320_1099872080375116_8320782486346924032_n.jpg",
    imageAlt: "Skara Ceilidh Band performing live",
  },
  media: {
    eyebrow: "Media",
    heading: "Media",
    subtitle: "Latest Skara Ceilidh Band performances from the official YouTube channel.",
  },
  services: {
    eyebrow: "Services",
    heading: "Professional ceilidh packages for every event.",
    subtitle:
      "From full ceilidh sets to background music, DJ/disco, and bagpiper options, we tailor each booking to your event.",
    ceilidhs: {
      intro:
        "Our professionalism, high energy, and lively sound help create a memorable event. Skara Ceilidh Band provides ceilidh music for events such as:",
      events: [
        "Weddings",
        "Corporate Events",
        "Ceilidhs",
        "Birthday Parties",
        "Student Events",
        "Private Functions",
      ],
      teaching:
        "We are highly experienced in calling and teaching ceilidh dances, from complete beginners to international audiences.",
      dances: [
        "Boston Two Step",
        "Canadian Barn Dance",
        "Circassian Circle",
        "Cumberland Square Eight",
        "Dashing White Sergeant",
        "Eightsome Reel",
        "Flying Scotsman",
        "Gay Gordons",
        "Highland Schottische",
        "Hooligan's Jig",
        "Military Two Step",
        "Orcadian Strip The Willow",
        "Riverside Jig",
        "St. Bernard's Waltz",
        "Strip The Willow",
        "Virginia Reel",
      ],
    },
    backgroundMusic: {
      intro:
        "Skara can provide background music for any occasion and tailor the line-up of musicians and instruments to suit your event.",
      events: [
        "Wedding Ceremony",
        "Drinks Reception",
        "Corporate Event",
        "Private Event",
      ],
    },
    djDisco: {
      intro:
        "Skara's DJ/disco service is very popular and is a great way to enhance your evening. The mix of ceilidh dancing and DJ/disco can incorporate both styles of music in one night.",
      details:
        "Your personal playlist can include your favourite songs for dancing. Our top-of-the-range PA system ensures high-quality sound production, and all timings are fully flexible to match your plans.",
      weddingFormatTitle: "Example wedding reception format",
      weddingFormat: [
        "Ceilidh Dancing (20:00)",
        "Background Music During the Break (21:30)",
        "DJ/Disco (22:00)",
        "Ceilidh Dancing to Round Off the Evening (23:00)",
        "Finish with Orcadian Strip the Willow, Auld Lang Syne, Loch Lomond, etc. (00:00)",
      ],
    },
    bagpiper: {
      intro:
        "Skara's bagpiper has years of experience as a professional musician and is available for tailored performances.",
      options: [
        "Pre-Ceremony: Arrival of your guests",
        "Ceremony: Entrance of the bride",
        "Signing of the register",
        "Ceremony: Exit of the bride and groom",
        "Post-Ceremony: Exit of your guests",
        "Drinks Reception: Welcome guests",
        "Arrival of top table / bride and groom",
      ],
    },
  },
  faqs: [
    {
      id: "faq-cost",
      question: "What is the cost?",
      answer: [
        "Our cost depends on factors including event location, travel costs, accommodation, and package requirements.",
        "Get in touch and we will send a tailored quote with all the details you need.",
      ],
    },
    {
      id: "faq-dance-instructions",
      question: "Are instructions for the ceilidh dances explained?",
      answer: [
        "Yes. The band is very experienced in calling ceilidh dances, with clear instructions and demonstrations where required.",
        "We regularly perform for international audiences, so language is no barrier. If guests already know the dances, we can move straight into dancing.",
      ],
    },
    {
      id: "faq-outside-scotland",
      question: "Does Skara Ceilidh Band perform outside Scotland?",
      answer: [
        "Yes. We are happy to travel anywhere to perform and each member has toured extensively around the world.",
      ],
    },
    {
      id: "faq-equipment",
      question: "Does the band bring their own sound and lighting equipment?",
      answer: [
        "Yes. We are self-sufficient and bring our own high-quality PA system and lights.",
        "All equipment is fully PAT tested.",
      ],
    },
    {
      id: "faq-setup-time",
      question: "How long does it take to set up the equipment?",
      answer: [
        "We require at least one hour to set up before performance and do this as discreetly as possible.",
      ],
    },
    {
      id: "faq-line-up",
      question: "Is the line-up always the same?",
      answer: [
        "We maintain a professional and energetic standard with top musicians in Scotland.",
        "If a regular member is unavailable, they are replaced by an experienced, high-quality musician.",
      ],
    },
    {
      id: "faq-insurance",
      question: "Does the band have Public Liability Insurance?",
      answer: [
        "Yes. We have PLI insurance through the Musicians' Union, and all equipment is PAT tested.",
      ],
    },
    {
      id: "faq-booking-steps",
      question: "What are the next steps to make a booking?",
      answer: [
        "Contact Skara Ceilidh Band by email with your event details.",
        "We will then prepare a contract.",
        "To secure your booking, return the signed contract with a 25% deposit.",
      ],
    },
  ],
  reviews: [
    {
      id: "review-alan-harrison",
      quote: [
        "Book this band - they are immense. We had the greatest fortune of having them at my daughter's wedding on Saturday and they did not let us down.",
        "Their high-energy music for the fast ceilidh dances was tempered with slow waltzes when needed to give everyone a breather. The dance floor was filled all night.",
        "Cannot recommend them highly enough.",
      ],
      author: "Alan Harrison",
    },
    {
      id: "review-rebecca-mcritchie",
      quote: [
        "Skara's ceilidh set was fantastic at our wedding, with many of our guests commenting on how good and enjoyable the dancing was.",
        "Excellent at calling the dances for those new to ceilidhing or needing a reminder. Thank you again!",
      ],
      author: "Rebecca McRitchie",
    },
    {
      id: "review-siobhan-stewart",
      quote: [
        "Choosing Skara to play at our wedding was one of our best decisions - they really made our evening.",
        "We had an amazing time ceilidh dancing with all of our guests, many of whom had never been to a ceilidh before.",
        "They were extremely talented musicians and even guests who did not dance enjoyed sitting and listening. Thanks so much for being part of our day!",
      ],
      author: "Siobhan Stewart",
    },
  ],
  contact: {
    eyebrow: "Contact",
    heading: "Check availability and request a tailored quote.",
    subtitle:
      "Share your event details and preferred date. We will get back to you with package options and next steps.",
  },
};
