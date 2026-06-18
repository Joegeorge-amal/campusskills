const fs = require('fs');
const path = require('path');

// Read existing questions
const existing = JSON.parse(fs.readFileSync(path.join(__dirname, 'questions.json'), 'utf8'));

// Track how many per skill we already have
const existingBySkill = {};
for (const q of existing) {
  if (!existingBySkill[q.skill]) existingBySkill[q.skill] = [];
  existingBySkill[q.skill].push(q);
}

// All skills that should have questions (from TopicService.java)
const allSkills = [
  // Programming & Tech (24)
  "Python","Java","C++","C","C#","JavaScript","TypeScript","React","Node.js","Express.js",
  "HTML/CSS","SQL","MongoDB","Git & GitHub","Docker","Kubernetes","AWS",
  "Android Development (Kotlin)","iOS Development (Swift)","Machine Learning",
  "Data Structures & Algorithms","Cybersecurity","Linux","Computer Networks",
  // Academic (14)
  "Calculus","Linear Algebra","Physics","Chemistry","Biology","Statistics","Economics",
  "History","Psychology","Literature","Discrete Mathematics","Operating Systems",
  "Database Management Systems","Public Speaking",
  // Creative (14)
  "UI/UX Design","Figma","Adobe Photoshop","Adobe Illustrator","Adobe Premiere Pro",
  "After Effects","Graphic Design","Video Editing","Photography","Blender (3D Modeling)",
  "Digital Illustration","Typography","Content Creation","YouTube Editing",
  // Languages (9)
  "English","Spanish","French","German","Japanese","Mandarin Chinese","Korean","Hindi","Sign Language",
  // Music (7)
  "Guitar","Piano","Vocals/Singing","Music Production (Ableton/FL Studio)","Audio Engineering","Violin","Drums",
  // Sports (8)
  "Chess","Fitness Coaching","Yoga","Basketball","Tennis","Swimming","Martial Arts","Dance"
];

console.log(`Existing: ${Object.keys(existingBySkill).length} skills with ${existing.length} total questions`);

// ========== NEW QUESTIONS ==========
// 10 additional questions for each existing skill (to bring to 20)
// 10 questions for each missing skill

const newQuestions = {};

function addQ(skill, question, options, correctAnswer, difficulty, explanation) {
  if (!newQuestions[skill]) newQuestions[skill] = [];
  newQuestions[skill].push({
    skill, question, options, correctAnswer, difficulty, explanation
  });
}

// ===== PYTHON (+10 = 20) =====
addQ("Python", "What is the purpose of the 'if __name__ == \"__main__\":' block in Python?",
  ["To check if the script is being run directly vs imported", "To define the main function of the class", "To check the Python version", "To initialize global variables"], 0, "medium",
  "This common pattern ensures code runs only when the file is executed directly, not when imported as a module.");
addQ("Python", "Which of the following correctly opens a file for writing in Python?",
  ["open('file.txt', 'r')", "open('file.txt', 'w')", "open('file.txt', 'a')", "open('file.txt', 'x')"], 1, "easy",
  "The 'w' mode opens a file for writing, creating it if it doesn't exist or truncating it if it does.");
addQ("Python", "What is a decorator in Python?",
  ["A design pattern for creating classes", "A function that takes another function and extends its behavior", "A built-in function for formatting strings", "A type annotation syntax"], 1, "medium",
  "Decorators use the @ syntax to wrap functions or methods, adding functionality like logging, timing, or access control.");
addQ("Python", "Which of the following creates a list comprehension that squares numbers 0-4?",
  ["[x*x for x in range(5)]", "squares(5)", "for x in range(5): x*x", "map(square, range(5))"], 0, "medium",
  "List comprehensions provide a concise way to create lists: [expression for item in iterable].");
addQ("Python", "What is the output of: print('Hello' + ' ' + 'World')?",
  ["Hello World", "Hello+ +World", "HelloWorld", "TypeError"], 0, "easy",
  "The + operator concatenates strings in Python, so 'Hello' + ' ' + 'World' produces 'Hello World'.");
addQ("Python", "Which data type is used to store a sequence of immutable bytes?",
  ["bytes", "bytearray", "list", "tuple"], 0, "hard",
  "The bytes type is an immutable sequence of bytes (integers 0-255), unlike bytearray which is mutable.");
addQ("Python", "How do you create a virtual environment in Python 3?",
  ["python -m venv myenv", "python create env myenv", "virtualenv create myenv", "pip venv myenv"], 0, "medium",
  "The built-in venv module creates isolated Python environments: python -m venv <env_name>.");
addQ("Python", "What does the 'yield' keyword do in Python?",
  ["Returns a value and continues execution on next call", "Terminates the function", "Pauses the program execution", "Raises an exception"], 0, "hard",
  "'yield' creates a generator function that produces a sequence of values lazily, preserving state between calls.");
addQ("Python", "Which magic method is called when an object is used as a string?",
  ["__str__", "__repr__", "__format__", "__unicode__"], 0, "medium",
  "__str__ defines the human-readable string representation returned by str() and print().");
addQ("Python", "What is the correct syntax for a lambda function that adds two numbers?",
  ["lambda x, y: x + y", "lambda(x, y) => x + y", "function(x, y) -> x + y", "def lambda(x, y): x + y"], 0, "easy",
  "Lambda functions use the syntax: lambda arguments: expression, producing an anonymous function.");

// ===== JAVA (+10 = 20) =====
addQ("Java", "Which keyword is used to implement inheritance in Java?",
  ["extends", "implements", "inherits", "super"], 0, "easy",
  "The 'extends' keyword is used by a class to inherit from a parent class in Java.");
addQ("Java", "What is the purpose of the 'this' keyword in Java?",
  ["To refer to the current object instance", "To call the parent constructor", "To create a new thread", "To define a constant"], 0, "medium",
  "'this' refers to the current object and is used to distinguish instance variables from parameters with the same name.");
addQ("Java", "Which of the following is a checked exception in Java?",
  ["NullPointerException", "ArithmeticException", "IOException", "ArrayIndexOutOfBoundsException"], 2, "medium",
  "Checked exceptions (like IOException) must be either caught or declared in the method signature. RuntimeExceptions are unchecked.");
addQ("Java", "What does the 'volatile' keyword guarantee in Java?",
  ["Visibility of changes to variables across threads", "Atomicity of compound operations", "Prevention of garbage collection", "Immutable variable"], 0, "hard",
  "volatile ensures that reads and writes to a variable are visible across all threads, preventing CPU cache inconsistencies.");
addQ("Java", "Which interface should a class implement to be used in a try-with-resources statement?",
  ["AutoCloseable", "Serializable", "Runnable", "Comparable"], 0, "hard",
  "AutoCloseable (or its subinterface Closeable) allows a class to be used in try-with-resources for automatic resource management.");
addQ("Java", "What is the default package in Java?",
  ["java.lang", "java.util", "java.io", "No default package; all classes must be in a named package"], 3, "medium",
  "If no package is declared, the class belongs to the unnamed default package, but this is discouraged for production code.");
addQ("Java", "What does the '===' operator do in Java?",
  ["This operator does not exist in Java", "Compares both value and type", "Compares references for equality", "Assigns with type checking"], 0, "easy",
  "Java does not have a '===' operator. It uses '==' for primitive comparison and reference equality, and '.equals()' for content equality.");
addQ("Java", "Which garbage collection concept involves objects that are no longer reachable?",
  ["Mark and Sweep", "Reference Counting", "Generational Collection", "Compact and Collect"], 0, "medium",
  "Mark-and-Sweep identifies live objects (mark phase) and reclaims memory from unmarked objects (sweep phase).");
addQ("Java", "What is the correct way to declare a generic method in Java?",
  ["public <T> void method(T param)", "public void method<T>(T param)", "public [T] void method(T param)", "public generic T void method(T param)"], 0, "hard",
  "Generic methods declare type parameters before the return type in angle brackets: <T> void method(T param).");
addQ("Java", "Which design pattern is implemented by Java's BufferedReader wrapping a FileReader?",
  ["Decorator", "Adapter", "Factory", "Singleton"], 0, "medium",
  "The Decorator pattern attaches additional responsibilities to an object dynamically. BufferedReader decorates a Reader with buffering.");

// ===== C++ (+10 = 20) =====
addQ("C++", "What is the correct syntax for a range-based for loop in C++?",
  ["for (int x : vec)", "for (int x in vec)", "foreach (int x in vec)", "for each x in vec"], 0, "medium",
  "C++11 introduced range-based for loops: for (element_type element : container) { ... }.");
addQ("C++", "What does the 'explicit' keyword prevent in C++?",
  ["Implicit conversions by constructors", "Multiple inheritance", "Virtual function overriding", "Template instantiation"], 0, "hard",
  "The explicit keyword prevents the compiler from using a constructor for implicit type conversions, requiring explicit casting.");
addQ("C++", "Which header provides smart pointers like std::unique_ptr?",
  ["<memory>", "<smart_ptr>", "<pointer>", "<utility>"], 0, "medium",
  "The <memory> header defines smart pointer classes including unique_ptr, shared_ptr, and weak_ptr.");
addQ("C++", "What is the difference between delete and delete[] in C++?",
  ["delete frees a single object, delete[] frees an array", "delete is for classes, delete[] is for primitives", "They are identical", "delete[] also zeros the memory"], 0, "medium",
  "delete calls the destructor for a single object, while delete[] calls destructors for each element in a dynamically allocated array.");
addQ("C++", "Which level of exception safety guarantees that the program state remains valid with no resources leaked?",
  ["Basic guarantee", "Strong guarantee", "No-throw guarantee", "Minimal guarantee"], 0, "hard",
  "The basic guarantee ensures that invariants are preserved and no resources leak, though the exact state may differ from before the operation.");
addQ("C++", "What is a lambda expression in C++?",
  ["An unnamed function object that can capture variables", "A named function defined inside another function", "A macro that expands to a function call", "A template metafunction"], 0, "medium",
  "C++11 lambdas are anonymous function objects that can capture variables from their enclosing scope by value or reference.");
addQ("C++", "What does the 'constexpr' specifier indicate?",
  ["The value can be evaluated at compile time", "The variable is constant", "The expression has no side effects", "The function is inline"], 0, "hard",
  "constexpr tells the compiler that a function or variable can be computed at compile time, enabling optimizations.");
addQ("C++", "Which algorithm header function finds the first occurrence of a value in a range?",
  ["std::find", "std::search", "std::locate", "std::find_if"], 0, "medium",
  "std::find returns an iterator to the first element equal to the given value in the specified range.");
addQ("C++", "What is the purpose of a move constructor?",
  ["To transfer resources from a temporary object efficiently", "To copy an object by value", "To move an object to a different memory location", "To reorder elements in a container"], 0, "hard",
  "Move constructors transfer ownership of resources (like heap memory) from a temporary to a new object, avoiding expensive deep copies.");
addQ("C++", "Which operator is used for exception handling in C++?",
  ["try-catch-throw", "try-except", "try-catch-finally", "on-error-goto"], 0, "easy",
  "C++ uses try blocks with catch handlers to handle exceptions, and the throw statement to raise them.");

// ===== JAVASCRIPT (+10 = 20) =====
addQ("JavaScript", "What is the event loop in JavaScript?",
  ["A mechanism that handles asynchronous callback execution", "A loop that iterates over array elements", "A DOM event handling system", "A loop that prevents infinite recursion"], 0, "medium",
  "The event loop continuously checks if the call stack is empty and if there are pending callbacks in the task queues to execute.");
addQ("JavaScript", "What is the spread operator used for?",
  ["Expanding iterables into individual elements", "Spreading code across multiple lines", "Creating a copy of a function", "Dividing numbers"], 0, "medium",
  "The spread syntax (...) expands arrays, objects, or other iterables into individual elements, commonly used for copying or merging.");
addQ("JavaScript", "What does the 'map()' method return?",
  ["A new array with transformed elements", "The original array modified", "A boolean indicating success", "An object with key-value pairs"], 0, "easy",
  "Array.prototype.map() creates a new array populated with the results of calling a function on every element.");
addQ("JavaScript", "What is the difference between null and undefined?",
  ["undefined means a variable has been declared but not assigned; null is an intentional absence of value", "They are exactly the same", "null is automatically assigned; undefined must be set manually", "undefined is a primitive; null is an object"], 0, "medium",
  "undefined means the value is missing because it was never set; null is an explicitly assigned empty value.");
addQ("JavaScript", "Which method removes the first element from an array?",
  ["shift()", "pop()", "unshift()", "filter()"], 0, "easy",
  "shift() removes the first element from an array and returns it, shifting all remaining elements down one index.");
addQ("JavaScript", "What is a 'getter' in JavaScript classes?",
  ["A method that gets the value of a property using the 'get' keyword", "A function that fetches API data", "A method that returns private fields", "An accessor that modifies property values"], 0, "medium",
  "Getters bind an object property to a function that runs when the property is accessed, using the 'get' keyword.");
addQ("JavaScript", "What does 'localStorage' provide in the browser?",
  ["Persistent key-value storage that survives page reloads", "Temporary session data cleared on tab close", "Server-side database storage", "An encrypted credential vault"], 0, "easy",
  "localStorage stores data with no expiration date, persisting even after the browser is closed and reopened.");
addQ("JavaScript", "What is the output of: console.log(0.1 + 0.2 === 0.3)?",
  ["false", "true", "undefined", "TypeError"], 0, "hard",
  "Floating-point arithmetic imprecision means 0.1 + 0.2 equals 0.30000000000000004, which is not strictly equal to 0.3.");
addQ("JavaScript", "Which method creates a new array with elements that pass a test?",
  ["filter()", "find()", "some()", "includes()"], 0, "easy",
  "filter() creates a new array containing only elements for which the callback function returns true.");
addQ("JavaScript", "What is destructuring in JavaScript?",
  ["Unpacking values from arrays or objects into distinct variables", "Destroying unused variables to free memory", "Removing elements from a data structure", "Converting a promise to its resolved value"], 0, "medium",
  "Destructuring uses syntax like const { name, age } = obj to extract properties into variables in a single expression.");

// ===== REACT (+10 = 20) =====
addQ("React", "What is the purpose of the dependency array in useEffect?",
  ["To specify which values should trigger the effect re-run", "To list the packages required by the component", "To define the type of effect to run", "To memoize the effect's return value"], 0, "medium",
  "The dependency array tells React when to re-execute the effect. An empty array [] runs it once; omitting it runs after every render.");
addQ("React", "How do you conditionally render a component in React?",
  ["Using &&, ternary, or if statements in JSX", "Using the show/hide attribute", "Using CSS display property", "Using the 'if' JSX element"], 0, "easy",
  "Conditional rendering in React uses JavaScript expressions like {condition && <Component />} or ternary {cond ? <A /> : <B />}.");
addQ("React", "What is the children prop in React?",
  ["The content passed between opening and closing component tags", "The number of child components rendered", "An array of all sub-components", "A prop that sets the child key"], 0, "medium",
  "props.children allows components to receive and render nested JSX content between their opening and closing tags.");
addQ("React", "What problem does the useCallback hook solve?",
  ["It memoizes function references to prevent unnecessary re-renders", "It caches API responses", "It creates callback functions dynamically", "It binds event handlers to the component"], 0, "medium",
  "useCallback returns a memoized version of a function that only changes if its dependencies change, useful for optimizing child component re-renders.");
addQ("React", "What is a controlled component in React?",
  ["A form element whose value is controlled by React state", "A component that cannot be modified", "A component wrapped in React.memo", "A component that uses refs exclusively"], 0, "medium",
  "In a controlled component, the form element's value is stored in React state and updated via onChange handlers, making React the single source of truth.");
addQ("React", "What is the function of key prop in React lists?",
  ["To uniquely identify elements for efficient re-rendering", "To encrypt sensitive data in lists", "To set CSS class names", "To define accessibility attributes"], 0, "easy",
  "Keys help React identify which items have changed, been added, or removed, enabling minimal DOM updates during reconciliation.");
addQ("React", "Which hook is used to create a mutable ref that persists across re-renders?",
  ["useRef", "useState", "useMemo", "useCallback"], 0, "easy",
  "useRef returns a mutable ref object whose .current property persists for the component's lifetime without causing re-renders.");
addQ("React", "What is React.StrictMode?",
  ["A development tool that highlights potential problems", "A security feature for authentication", "A production optimization mode", "A CSS framework for strict styling"], 0, "medium",
  "StrictMode activates additional checks and warnings in development, such as detecting unsafe lifecycle methods and legacy API usage.");
addQ("React", "How would you fetch data when a component mounts in React?",
  ["Using useEffect with an empty dependency array", "Calling fetch() directly in the component body", "Using componentDidUpdate", "Using the fetch hook"], 0, "easy",
  "useEffect(() => { fetch(...) }, []) runs the effect once after the initial render, making it ideal for data fetching on mount.");
addQ("React", "What is the purpose of React portals?",
  ["Rendering a component outside the parent DOM hierarchy", "Routing between different pages", "Managing global state", "Creating modals within the component tree"], 0, "medium",
  "createPortal renders children into a different DOM node outside the parent component's DOM hierarchy, useful for modals, tooltips, and overlays.");

// Continue for remaining 32 existing skills and all 31 missing skills...
// Given the massive scope, I'll write a compact generator.

console.log("Existing skills with questions:", Object.keys(existingBySkill).length);
console.log("All skills needed:", allSkills.length);
console.log("Missing skills:", allSkills.filter(s => !existingBySkill[s]).length);
