// src/data/quizData.js

// A generic fallback quiz
const genericQuiz = {
  domain: 'General',
  questions: [
    {
      id: 1,
      text: "Which of the following best describes your ability in this skill?",
      options: [
        "I have theoretical knowledge but no practical experience.",
        "I can perform basic tasks with supervision.",
        "I am capable of executing standard projects independently.",
        "I am an expert and can mentor others."
      ],
      correctIndex: 2
    },
    {
      id: 2,
      text: "How often do you apply this skill in a practical setting?",
      options: [
        "Rarely",
        "Occasionally (a few times a month)",
        "Regularly (weekly)",
        "Daily"
      ],
      correctIndex: 3
    },
    {
      id: 3,
      text: "When facing a complex problem related to this skill, what is your first step?",
      options: [
        "Ask a mentor for the complete solution.",
        "Consult documentation and attempt to break the problem down.",
        "Ignore the problem and hope it resolves itself.",
        "Try random solutions until one works."
      ],
      correctIndex: 1
    }
  ]
};

// Specific mock quizzes based on skill names
const skillQuizzes = {
  'React.js': {
    domain: 'Frontend',
    questions: [
      {
        id: 1,
        text: "What hook is used to manage local state in a functional component?",
        options: ["useEffect", "useState", "useContext", "useReducer"],
        correctIndex: 1
      },
      {
        id: 2,
        text: "Which of the following is NOT a rule of Hooks?",
        options: [
          "Only call Hooks at the top level",
          "Only call Hooks from React function components",
          "Hooks can be called inside loops or conditions",
          "Custom hooks must start with 'use'"
        ],
        correctIndex: 2
      },
      {
        id: 3,
        text: "What does the useEffect dependency array do?",
        options: [
          "It defines which variables the effect reads, controlling when the effect re-runs.",
          "It stores local state for the component.",
          "It automatically fetches data from the listed endpoints.",
          "It defines the CSS classes to be applied."
        ],
        correctIndex: 0
      }
    ]
  },
  'Figma UI': {
    domain: 'Design',
    questions: [
      {
        id: 1,
        text: "What keyboard shortcut is commonly used to create a Frame in Figma?",
        options: ["F", "A", "V", "Both F and A"],
        correctIndex: 3
      },
      {
        id: 2,
        text: "Which feature allows you to create reusable design elements?",
        options: ["Groups", "Frames", "Components", "Auto Layout"],
        correctIndex: 2
      },
      {
        id: 3,
        text: "What does Auto Layout do?",
        options: [
          "Automatically generates a color palette.",
          "Creates responsive layouts that grow or shrink as contents change.",
          "Automatically saves the file to the cloud.",
          "Animates transitions between frames."
        ],
        correctIndex: 1
      }
    ]
  }
};

export const getQuizForSkill = (skillName) => {
  // Return a specific quiz if available, otherwise return the generic fallback
  const quiz = skillQuizzes[skillName] || genericQuiz;
  
  // We return a deep copy to prevent any state mutation issues
  return JSON.parse(JSON.stringify(quiz));
};
