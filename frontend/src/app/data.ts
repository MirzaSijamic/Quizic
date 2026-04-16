export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type QuizQuestion = {
  id: number;
  question: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
};

export type QuizData = {
  id: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore?: number;
  courseId: number;
  courseTitle: string;
};

export type Lesson = {
  title: string;
  videos: { title: string; url: string }[];
  materials: { title: string; url: string }[];
  exercises: { title: string; url: string; quiz?: QuizData }[];
};

export type Course = {
  id: number;
  title: string;
  level: CourseLevel;
  //status: 'Finished' | 'Unfinished';
  lessons: Lesson[];
};

export const MOCK_COURSES: Course[] = [
  // BEGINNER COURSES
  {
    id: 1,
    title: "Welcome to eMP",
    level: "Beginner",
    //status: "Finished",
    lessons: [
      {
        title: "Presentation",
        videos: [{ title: "Welcome to AdOps presentation", url: "#" }],
        materials: [],
        exercises: [{ title: "Write an email to your manager asking questions about the Guide and Presentation.", url: "#" }]
      },
      {
        title: "eMP History",
        videos: [],
        materials: [{ title: "Welcome Guide", url: "#" }],
        exercises: []
      },
      { title: "Ecosystem", videos: [], materials: [], exercises: [] },
      { title: "Culture", videos: [], materials: [], exercises: [] },
      { title: "Company Principles & Values", videos: [], materials: [], exercises: [] }
    ]
  },
  {
    id: 2,
    title: "Digital Marketing 101 eMP Academy",
    level: "Beginner",
    //status: "Finished",
    lessons: [
      {
        title: "Triangle",
        videos: [{ title: "AI Video - Triangle", url: "#" }],
        materials: [{ title: "Triangle", url: "#" }],
        exercises: []
      },
      {
        title: "Teams & Departments",
        videos: [],
        materials: [{ title: "Departments", url: "#" }],
        exercises: [{ 
          title: "eMP Departments Quiz", 
          url: "#",
          quiz: {
            id: 1,
            title: "eMP Departments Quiz",
            description: "Test your knowledge about different departments within eMP",
            courseId: 2,
            courseTitle: "Digital Marketing 101 eMP Academy",
            passingScore: 70,
            questions: [
              {
                id: 1,
                question: "Which department is responsible for managing client relationships and campaign setup?",
                options: [
                  "Finance",
                  "AdOps",
                  "Engineering",
                  "HR"
                ],
                correctAnswer: "AdOps",
                explanation: "AdOps (Ad Operations) manages client relationships, campaign setup, and trafficking."
              },
              {
                id: 2,
                question: "What is the primary role of the Sales team?",
                options: [
                  "Managing server infrastructure",
                  "Acquiring new clients and revenue",
                  "Designing creative assets",
                  "Writing code for ad platforms"
                ],
                correctAnswer: "Acquiring new clients and revenue",
                explanation: "The Sales team focuses on business development and acquiring new clients."
              },
              {
                id: 3,
                question: "Which team handles technical integration and platform development?",
                options: [
                  "Marketing",
                  "Sales",
                  "Engineering/Tech",
                  "Operations"
                ],
                correctAnswer: "Engineering/Tech",
                explanation: "The Engineering/Tech team is responsible for platform development and technical integrations."
              },
              {
                id: 4,
                question: "What does the Finance department primarily handle?",
                options: [
                  "Campaign optimization",
                  "Invoicing, billing, and financial reporting",
                  "Creative production",
                  "Client support"
                ],
                correctAnswer: "Invoicing, billing, and financial reporting",
                explanation: "Finance manages all monetary aspects including invoicing, billing, and financial reporting."
              },
              {
                id: 5,
                question: "Which department focuses on employee development and company culture?",
                options: [
                  "Sales",
                  "Human Resources",
                  "Finance",
                  "AdOps"
                ],
                correctAnswer: "Human Resources",
                explanation: "HR manages employee development, recruitment, and maintains company culture."
              }
            ]
          }
        }]
      },
      {
        title: "Presales/Postsales",
        videos: [{ title: "AI Video - Presales and postsales", url: "#" }],
        materials: [{ title: "Presales & Postsales Process", url: "#" }],
        exercises: [{ title: "Try to define where each eMP team fits in the process.", url: "#" }]
      }
    ]
  },
  {
    id: 3,
    title: "Computer Literacy",
    level: "Beginner",
    //status: "Finished",
    lessons: [
      {
        title: "Writting/Remembering Shortcuts",
        videos: [],
        materials: [{ title: "Excel Shortcuts", url: "#" }],
        exercises: [{ title: "Make a list of all the shortcuts you are familiar with, or may have used.", url: "#" }]
      },
      {
        title: "Task Manager",
        videos: [],
        materials: [{ title: "Task Manager", url: "#" }],
        exercises: [{ title: "Organize your start-up apps.", url: "#" }]
      },
      {
        title: "Microsoft Office Packages",
        videos: [],
        materials: [],
        exercises: [{ title: "Organize your Outlook with rules and folders. Create a separate folder for Newsletters.", url: "#" }]
      }
    ]
  },
  {
    id: 4,
    title: "Excel Literacy",
    level: "Beginner",
    //status: "Unfinished",
    lessons: [
      {
        title: "Excel formats (CSV, XLSX)",
        videos: [{ title: "File types", url: "#" }],
        materials: [{ title: "Full Excel Guide", url: "#" }],
        exercises: []
      },
      {
        title: "Formulas (Vlookup, Sumifs,...)",
        videos: [{ title: "Formulas", url: "#" }],
        materials: [],
        exercises: []
      },
      {
        title: "Pivot",
        videos: [{ title: "Pivot", url: "#" }],
        materials: [],
        exercises: []
      },
      {
        title: "Conditional Formating",
        videos: [{ title: "Conditional Formatting", url: "#" }],
        materials: [],
        exercises: []
      }
    ]
  },
  {
    id: 5,
    title: "DM 101 (Ben Silverstein)",
    level: "Beginner",
    //status: "Unfinished",
    lessons: [
      {
        title: "Standard Ad Formats (IAB)",
        videos: [{ title: "DM 101 (Ben Silverstein) Udemy Course", url: "#" }],
        materials: [{ title: "Standard IAB Ad Formats", url: "#" }],
        exercises: [{ title: "Standard IAB Ad Formats- Make a Copy", url: "#" }]
      },
      {
        title: "Basic measured actions (Terminology: Impression, Click, View, Conversion, Video starts, Video completes)",
        videos: [],
        materials: [{ title: "Basic Metrics", url: "#" }],
        exercises: [{ title: "Basic Metrics - Make a copy", url: "#" }]
      },
      {
        title: "Bacis metrics (Terminology: CTR, CTA, VCR)",
        videos: [],
        materials: [],
        exercises: []
      },
      {
        title: "Cost methods (Terminology: CPM, CPC/CPA, CPV)",
        videos: [],
        materials: [{ title: "Basic Cost Methods", url: "#" }],
        exercises: [{ title: "Basic Cost Methods- Make a copy", url: "#" }]
      }
    ]
  },
  {
    id: 6,
    title: "IO & Media Plans",
    level: "Beginner",
    //status: "Unfinished",
    lessons: [
      {
        title: "Reading Media Plans & IOs",
        videos: [{ title: "Reading IOs", url: "#" }],
        materials: [{ title: "IO Example #1", url: "#" }],
        exercises: [{ title: "Media plan - Make a copy", url: "#" }]
      },
      {
        title: "Prisma",
        videos: [],
        materials: [{ title: "IO Example #2", url: "#" }],
        exercises: []
      },
      {
        title: "Creating Media Plans",
        videos: [],
        materials: [{ title: "Create a MP", url: "#" }],
        exercises: []
      }
    ]
  },
  {
    id: 7,
    title: "Ad Servers",
    level: "Beginner",
    //status: "Unfinished",
    lessons: [
      {
        title: "Functionalities",
        videos: [{ title: "Ad servers", url: "#" }],
        materials: [{ title: "Ad Servers", url: "#" }],
        exercises: []
      },
      {
        title: "Basic/General Layout",
        videos: [{ title: "Layout", url: "#" }],
        materials: [],
        exercises: []
      },
      {
        title: "Examples(GAM, Google Ads, CM360...)",
        videos: [],
        materials: [],
        exercises: [{ 
          title: "Ad Server Fundamentals Quiz", 
          url: "#",
          quiz: {
            id: 2,
            title: "Ad Server Fundamentals Quiz",
            description: "Test your understanding of ad servers, SSP, and DSP technologies",
            courseId: 7,
            courseTitle: "Ad Servers",
            passingScore: 75,
            questions: [
              {
                id: 6,
                question: "What is the primary function of an Ad Server?",
                options: [
                  "To design creative advertisements",
                  "To store, manage, and deliver digital advertisements",
                  "To create social media content",
                  "To build websites"
                ],
                correctAnswer: "To store, manage, and deliver digital advertisements",
                explanation: "Ad servers are technology platforms that store advertising content and decide which ads to show to users based on targeting criteria."
              },
              {
                id: 7,
                question: "What does SSP stand for?",
                options: [
                  "Server Side Protocol",
                  "Sell Side Platform",
                  "Standard Sales Process",
                  "System Security Platform"
                ],
                correctAnswer: "Sell Side Platform",
                explanation: "SSP (Sell Side Platform) helps publishers sell their ad inventory to advertisers in an automated way."
              },
              {
                id: 8,
                question: "What does DSP stand for?",
                imageUrl: "https://images.unsplash.com/photo-1716281793715-a39466d85526?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYWR2ZXJ0aXNpbmclMjB0ZWNobm9sb2d5JTIwbmV0d29ya3xlbnwxfHx8fDE3NzM5Mjg1NTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
                options: [
                  "Digital Service Provider",
                  "Demand Side Platform",
                  "Data Security Protocol",
                  "Direct Sales Partner"
                ],
                correctAnswer: "Demand Side Platform",
                explanation: "DSP (Demand Side Platform) allows advertisers to buy ad inventory across multiple platforms in an automated fashion."
              },
              {
                id: 9,
                question: "Which platform would a publisher primarily use?",
                options: [
                  "DSP",
                  "SSP",
                  "CRM",
                  "CMS"
                ],
                correctAnswer: "SSP",
                explanation: "Publishers use SSPs (Sell Side Platforms) to manage and sell their advertising inventory to the highest bidder."
              },
              {
                id: 10,
                question: "What is the main difference between an Ad Server and a DSP?",
                options: [
                  "Ad servers only work with video ads",
                  "Ad servers store and deliver ads, while DSPs help buy ad inventory",
                  "DSPs are only for mobile advertising",
                  "There is no difference"
                ],
                correctAnswer: "Ad servers store and deliver ads, while DSPs help buy ad inventory",
                explanation: "Ad servers focus on ad delivery and management, while DSPs are buying platforms that help advertisers purchase inventory programmatically."
              },
              {
                id: 11,
                question: "Which of these is an example of an Ad Server?",
                options: [
                  "Facebook",
                  "Google Ad Manager (GAM)",
                  "Instagram",
                  "WordPress"
                ],
                correctAnswer: "Google Ad Manager (GAM)",
                explanation: "Google Ad Manager (formerly DoubleClick for Publishers) is one of the most widely used ad serving platforms."
              }
            ]
          }
        }]
      }
    ]
  },
  {
    id: 8,
    title: "Reporting",
    level: "Beginner",
    //status: "Unfinished",
    lessons: [
      {
        title: "Building report templates (based on the media plans)",
        videos: [{ title: "Reporting Templates", url: "#" }],
        materials: [],
        exercises: [{ title: "Reporting Template - Make a copy", url: "#" }]
      }
    ]
  },
  {
    id: 9,
    title: "GAM Reporting",
    level: "Beginner",
    //status: "Unfinished",
    lessons: [
      {
        title: "Pulling GAM reports (history & reach)",
        videos: [{ title: "GAM Reporting", url: "#" }],
        materials: [{ title: "GAM Reporting", url: "#" }],
        exercises: [{ title: "Pull a report with Geo split. Pick 1 live campaign.", url: "#" }]
      },
      {
        title: "(NEW) Interactive reports",
        videos: [],
        materials: [],
        exercises: []
      },
      {
        title: "Scheduling reports",
        videos: [],
        materials: [],
        exercises: [{ title: "Try to schedule 1 report to your eMP email.", url: "#" }]
      }
    ]
  },
  // INTERMEDIATE COURSES
  {
    id: 10,
    title: "GAM Trafficking",
    level: "Intermediate",
    //status: "Unfinished",
    lessons: [
      {
        title: "GAM Structure + Hierarchy",
        videos: [{ title: "GAM - general", url: "#" }],
        materials: [],
        exercises: [{ title: "GAM Navigation - Make a copy", url: "#" }]
      },
      {
        title: "Order Level",
        videos: [{ title: "Order", url: "#" }],
        materials: [],
        exercises: []
      },
      {
        title: "Line item (line item priorities, seeting up dates + blackouts, delivery, creative rotation, frequency caps, custom targeting)",
        videos: [{ title: "Line Items", url: "#" }],
        materials: [],
        exercises: []
      },
      {
        title: "Creatives (creative templates, creative weight)",
        videos: [{ title: "Creatives", url: "#" }],
        materials: [],
        exercises: []
      }
    ]
  },
  {
    id: 11,
    title: "DM 201 (Ben Silverstein)",
    level: "Intermediate",
    //status: "Unfinished",
    lessons: [
      {
        title: "Creative types (Image, HTML, Script/TAG)",
        videos: [{ title: "DM 201 (Ben Silverstein) Udemy Course", url: "#" }],
        materials: [],
        exercises: [{ title: "Creative Types - Make a copy", url: "#" }]
      },
      {
        title: "Secondary metrics (Viewability, Brand Safety, IVTR)",
        videos: [],
        materials: [{ title: "Secondary Metrics", url: "#" }],
        exercises: [{ title: "Secondary Metrics - Make a copy", url: "#" }]
      },
      {
        title: "Pixels/Trackers",
        videos: [{ title: "Tags vs Trackers", url: "#" }],
        materials: [{ title: "Tags & Trackers", url: "#" }],
        exercises: [{ title: "Tags vs Trackers - Make a copy", url: "#" }]
      },
      {
        title: "Third Party Vendors (DCM, Sizmek, Flashlight, AdReform, IAS, DoubleVerify, Moat,...)",
        videos: [],
        materials: [{ title: "Vendors and their tags", url: "#" }],
        exercises: []
      },
      {
        title: "Programmatic sales vs Direct vs PMP",
        videos: [{ title: "PG vs Direct", url: "#" }],
        materials: [{ title: "Programmatic vs Direct Sales", url: "#" }],
        exercises: [{ title: "Programmatic vs Direct - Make a copy", url: "#" }]
      }
    ]
  },
  {
    id: 12,
    title: "Insights & Recommendation",
    level: "Intermediate",
    //status: "Unfinished",
    lessons: [
      {
        title: "Mid campaign report Consultancy",
        videos: [{ title: "Insights", url: "#" }],
        materials: [],
        exercises: []
      },
      {
        title: "Final Reporting Insights",
        videos: [],
        materials: [],
        exercises: []
      }
    ]
  },
  {
    id: 13,
    title: "DCM Reporting",
    level: "Intermediate",
    //status: "Unfinished",
    lessons: [
      {
        title: "pulling DCM reports",
        videos: [{ title: "DCM Reporting", url: "#" }],
        materials: [{ title: "DCM Reporting", url: "#" }],
        exercises: []
      },
      {
        title: "Custom reports - Metrics & Dimensions (sites, platforms, placements, filtering)",
        videos: [],
        materials: [],
        exercises: []
      },
      {
        title: "Scheduling reports",
        videos: [],
        materials: [],
        exercises: []
      }
    ]
  },
  {
    id: 14,
    title: "Discrepancy",
    level: "Intermediate",
    //status: "Unfinished",
    lessons: [
      {
        title: "What is discrepancy?",
        videos: [{ title: "ZLAJA", url: "#" }],
        materials: [{ title: "Discrepancy", url: "#" }],
        exercises: []
      },
      {
        title: "Matching placements in reports",
        videos: [],
        materials: [],
        exercises: []
      },
      {
        title: "Discrepancy formula + negative/positive discrepancy values",
        videos: [],
        materials: [],
        exercises: []
      }
    ]
  },
  {
    id: 15,
    title: "Secondary metrics reporting",
    level: "Intermediate",
    //status: "Unfinished",
    lessons: [
      {
        title: "Pulling reports from DoubleVerify, Moat, IAS",
        videos: [{ title: "Secondary Metrics", url: "#" }],
        materials: [{ title: "Secondary Metrics", url: "#" }],
        exercises: []
      },
      {
        title: "Reporting viewability, brand safety, IVTR + benchmarks",
        videos: [{ title: "NEDA", url: "#" }],
        materials: [],
        exercises: []
      }
    ]
  },
  {
    id: 16,
    title: "Celtra Reporting",
    level: "Intermediate",
    //status: "Unfinished",
    lessons: [
      {
        title: "Pulling Reports",
        videos: [{ title: "Celtra Reporting", url: "#" }],
        materials: [{ title: "Celtra Reporting", url: "#" }],
        exercises: []
      }
    ]
  },
  {
    id: 17,
    title: "Billing & Invoicing",
    level: "Intermediate",
    //status: "Unfinished",
    lessons: [
      {
        title: "Billing",
        videos: [{ title: "OMAR", url: "#" }],
        materials: [],
        exercises: [{ title: "Billing - Make a copy", url: "#" }]
      },
      {
        title: "Capping spend",
        videos: [],
        materials: [],
        exercises: [{ title: "Capping Spend - Make a copy", url: "#" }]
      }
    ]
  },
  {
    id: 18,
    title: "Inventory Management",
    level: "Intermediate",
    //status: "Unfinished",
    lessons: [
      {
        title: "Inventory forecasting",
        videos: [{ title: "Forecasting", url: "#" }],
        materials: [],
        exercises: []
      },
      {
        title: "Pacing Checks & Reporting",
        videos: [{ title: "Pacing & Delivery", url: "#" }],
        materials: [],
        exercises: []
      },
      {
        title: "Optimizations",
        videos: [{ title: "Optimizations", url: "#" }],
        materials: [],
        exercises: []
      },
      {
        title: "Troubleshooting & Googfc",
        videos: [{ title: "Troubleshoot & Googfc", url: "#" }],
        materials: [],
        exercises: []
      }
    ]
  },
  {
    id: 19,
    title: "Test pages & Screenshots",
    level: "Intermediate",
    //status: "Unfinished",
    lessons: [
      {
        title: "Creating test pages",
        videos: [{ title: "Test Page", url: "#" }],
        materials: [],
        exercises: []
      },
      {
        title: "SS Deck",
        videos: [],
        materials: [],
        exercises: []
      }
    ]
  },
  {
    id: 20,
    title: "Video Campaigns",
    level: "Intermediate",
    //status: "Unfinished",
    lessons: [
      {
        title: "Video Inventory",
        videos: [{ title: "Video Inventory", url: "#" }],
        materials: [],
        exercises: []
      },
      {
        title: "Video Ad Formats",
        videos: [],
        materials: [],
        exercises: []
      },
      {
        title: "Vast/Vpaid",
        videos: [],
        materials: [],
        exercises: []
      },
      {
        title: "VCR Optimizations",
        videos: [],
        materials: [],
        exercises: []
      }
    ]
  },
  {
    id: 21,
    title: "Soft Skills",
    level: "Intermediate",
    //status: "Unfinished",
    lessons: [
      {
        title: "Email communication",
        videos: [{ title: "Professional Emails", url: "#" }],
        materials: [{ title: "Emails - How To", url: "#" }],
        exercises: [{ title: "Write an email - Make a copy", url: "#" }]
      },
      {
        title: "Informal communication (Slack, g-Chat, Teams,..)",
        videos: [],
        materials: [{ title: "All communication and fuck-up language", url: "#" }],
        exercises: []
      },
      {
        title: "Calls",
        videos: [],
        materials: [],
        exercises: []
      },
      {
        title: "Public Speaking",
        videos: [{ title: "Public Speaking", url: "#" }],
        materials: [{ title: "Public Speaking Tips", url: "#" }],
        exercises: [{ title: "Pick A Date.", url: "#" }]
      }
    ]
  },
  // ADVANCED COURSES
  {
    id: 22,
    title: "AdTech and more",
    level: "Advanced",
    //status: "Unfinished",
    lessons: [
      {
        title: "HTML/JS training",
        videos: [{ title: "HTML/JS Training", url: "#" }],
        materials: [],
        exercises: []
      },
      {
        title: "Custom scenario practice",
        videos: [],
        materials: [],
        exercises: [{ title: "Case studies - Make a copy", url: "#" }]
      }
    ]
  }
];


export const USER_INFO = {
  name: "Mirza Sijamić",
  role: "User",
  startDate: "Oct 15, 2023",
  graduationDate: "Jun 30, 2024",
};

export const MENTORS = [
  { name: "Sanida Fatic", title: "Director" },
  { name: "Amila Maric", title: "Associate Director" },
  { name: "Faris Comor", title: "Senior Manager" },
  { name: "Ema Kunic", title: "Senior Manager" },
  { name: "Benjamin Spago", title: "Manager" },
  { name: "Nudzejma Halilovic", title: "Manager" },
  { name: "Nedim Mehmedika", title: "Manager" },
];

export const MOCK_STUDENTS = [
  {
    id: 1,
    name: "Mirza Sijamić",
    role: "User",
    startDate: "Oct 15, 2023",
    graduationDate: "Jun 30, 2024",
    finishedCourseIds: [1, 2, 3],
  },
  {
    id: 2,
    name: "Amina Delic",
    role: "User",
    startDate: "Jan 10, 2024",
    graduationDate: "Aug 15, 2024",
    finishedCourseIds: [1],
  },
  {
    id: 3,
    name: "Haris Kadic",
    role: "User",
    startDate: "Nov 01, 2023",
    graduationDate: "Jul 20, 2024",
    finishedCourseIds: [1, 2, 3, 4, 5],
  },
  {
    id: 4,
    name: "Lejla Hodzic",
    role: "User",
    startDate: "Sep 05, 2023",
    graduationDate: "May 10, 2024",
    finishedCourseIds: [1, 2],
  }
];

export const HELPFUL_LINKS = [
  { topic: "Ad Servers", link: "https://smartyads.com/blog/what-is-an-ad-server/" },
  { topic: "Viewability", link: "https://www.thinkwithgoogle.com/marketing-strategies/video/5-factors-of-viewability/" },
  { topic: "VAST vs VPAID", link: "https://www.adpushup.com/blog/vast-vs-vpaid/#:~:text=Difference%20Between%20VAST%20And%20VPAID%2C%20Explained,-We%20discussed%20the&text=VAST%3A%20To%20enable%20video%20ads,the%20video%20player%20as%20instructed." },
  { topic: "Everything You Wanted to Know About AdOps", link: "https://builtin.com/marketing/ad-ops" },
  { topic: "The Ultimate Guide to AdOps", link: "https://adops.wiki/" },
  { topic: "AdOps Insider", link: "https://www.adopsinsider.com/category/ad-ops-basics/" },
  { topic: "IAS", link: "https://www.insiderintelligence.com/data-providers/integral-ad-science/#:~:text=IAS%20is%20a%20technology%20company,and%20support%20contextual%20ad%20targeting." },
  { topic: "IVT", link: "https://www.google.com/ads/adtrafficquality/invalid-activity/" },
  { topic: "Programmatic Campaigns", link: "https://emediapatchcom.sharepoint.com/:b:/s/AdOpsAdTechTrainingMaterials/EZjfddxhrMZJpL3l0IK9G_QBzlYMQZ2jXUxizhMqOQTGcA?e=HuAIZh" },
  { topic: "Tutorials", link: "https://easyadpeasy.tech/" },
];

export const UDEMY_COURSES_LIST = [
  "Digital Advertising and Marketing 301: Professional's Course",
  "Big Data in Advertising - Explained in Plain English",
  "Introduction to Programmatic Advertising - Digital Marketing",
  "Microsoft Excel - Excel from Beginner to Advanced",
  "Guy Kawasaki: The Art of Evangelism",
  "Instagram Marketing 2022: Complete Guide To Instagram Growth",
  "Sales Training: Practical Sales Techniques",
  "2021 Complete Public Speaking Masterclass For Every Occasion",
  "101 Crucial Lessons They Don't Teach You In Business School"
];