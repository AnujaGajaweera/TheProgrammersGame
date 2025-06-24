import { GameLevel } from '../types/game';

export const gameLevels: GameLevel[] = [
  {
    id: 0,
    name: 'Practice',
    title: 'Level 0: Practice',
    description: 'A sandbox to warm up your fingers. No pressure, just code.',
    difficulty: 'practice',
    unlocked: true,
    completed: false,
    rules: [],
    newRules: [],
    challenges: [
      {
        id: 'practice-1',
        title: 'Hello World',
        description: 'Print "Hello, World!" to the console',
        type: 'code',
        starterCode: '# Write your code here\n',
        expectedOutput: 'Hello, World!',
        solution: 'print("Hello, World!")',
        hint: 'Use the print() function to display text'
      },
      {
        id: 'practice-2',
        title: 'Simple Math',
        description: 'Calculate 15 + 27 and print the result',
        type: 'code',
        starterCode: '# Calculate 15 + 27\n',
        expectedOutput: '42',
        solution: 'print(15 + 27)',
        hint: 'Use the + operator for addition'
      },
      {
        id: 'practice-3',
        title: 'Variable Basics',
        description: 'Create a variable called "message" with value "Python is fun!" and print it',
        type: 'code',
        starterCode: '# Create and print a variable\n',
        expectedOutput: 'Python is fun!',
        solution: 'message = "Python is fun!"\nprint(message)',
        hint: 'Variables store values that can be used later'
      }
    ]
  },
  {
    id: 1,
    name: 'Noob',
    title: 'Level 1: Noob',
    description: 'Your first real challenge. Syntax and structure.',
    difficulty: 'noob',
    unlocked: false,
    completed: false,
    rules: [],
    newRules: ['All answers must use variables (no hardcoding values)'],
    challenges: [
      {
        id: 'noob-1',
        title: 'Variable Assignment',
        description: 'Create a variable called "age" with value 25, then print it',
        type: 'code',
        starterCode: '# Create variable age = 25 and print it\n',
        expectedOutput: '25',
        solution: 'age = 25\nprint(age)',
        hint: 'Remember: no hardcoding in print statements!'
      },
      {
        id: 'noob-2',
        title: 'String Replacement',
        description: 'Replace "World" with "Python" in "Hello World" using variables only',
        type: 'code',
        starterCode: '# Replace words using variables\noriginal = "Hello World"\n',
        expectedOutput: 'Hello Python',
        solution: 'original = "Hello World"\nreplacement = original.replace("World", "Python")\nprint(replacement)',
        hint: 'Use the replace() method and store results in variables'
      },
      {
        id: 'noob-3',
        title: 'Name Formatter',
        description: 'Create variables for first name "Alice" and last name "Smith", then print "Smith, Alice"',
        type: 'code',
        starterCode: '# Format name as "Last, First"\n',
        expectedOutput: 'Smith, Alice',
        solution: 'first_name = "Alice"\nlast_name = "Smith"\nformatted = last_name + ", " + first_name\nprint(formatted)',
        hint: 'Concatenate strings with variables, not hardcoded values'
      }
    ]
  },
  {
    id: 2,
    name: 'Easy',
    title: 'Level 2: Easy',
    description: 'Logic time! Introduces control flow.',
    difficulty: 'easy',
    unlocked: false,
    completed: false,
    rules: ['All answers must use variables (no hardcoding values)'],
    newRules: ['Every loop must terminate (or face the infinite loop animation)'],
    challenges: [
      {
        id: 'easy-1',
        title: 'Number Guesser Logic',
        description: 'Create a number guessing game that checks if a guess (7) matches the target (10)',
        type: 'code',
        starterCode: '# Build number guesser logic\ntarget = 10\nguess = 7\n',
        expectedOutput: 'Too low!',
        solution: 'target = 10\nguess = 7\nif guess < target:\n    print("Too low!")\nelif guess > target:\n    print("Too high!")\nelse:\n    print("Correct!")',
        hint: 'Use if/elif/else to compare the guess with the target'
      },
      {
        id: 'easy-2',
        title: 'Count to Ten',
        description: 'Use a loop to print numbers 1 through 10',
        type: 'code',
        starterCode: '# Loop from 1 to 10\n',
        expectedOutput: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10',
        solution: 'for i in range(1, 11):\n    print(i)',
        hint: 'Use range(1, 11) to get numbers 1 through 10'
      },
      {
        id: 'easy-3',
        title: 'Even Number Filter',
        description: 'Print only even numbers from 2 to 20 using a loop and condition',
        type: 'code',
        starterCode: '# Print even numbers 2-20\n',
        expectedOutput: '2\n4\n6\n8\n10\n12\n14\n16\n18\n20',
        solution: 'for i in range(2, 21):\n    if i % 2 == 0:\n        print(i)',
        hint: 'Use the modulo operator (%) to check if a number is even'
      }
    ]
  },
  {
    id: 3,
    name: 'Normal',
    title: 'Level 3: Normal',
    description: 'Functions, errors, and reusable logic.',
    difficulty: 'normal',
    unlocked: false,
    completed: false,
    rules: [
      'All answers must use variables (no hardcoding values)',
      'Every loop must terminate (or face the infinite loop animation)'
    ],
    newRules: ['Every function must include a docstring and no global variables allowed'],
    challenges: [
      {
        id: 'normal-1',
        title: 'Password Strength Checker',
        description: 'Create a function that checks if a password is strong (8+ chars, has numbers)',
        type: 'code',
        starterCode: '# Create password strength checker\ndef check_password_strength(password):\n    # Add docstring and logic here\n    pass\n\nresult = check_password_strength("abc123")\nprint(result)',
        expectedOutput: 'Weak',
        solution: 'def check_password_strength(password):\n    """Check if password meets strength requirements"""\n    if len(password) >= 8 and any(c.isdigit() for c in password):\n        return "Strong"\n    else:\n        return "Weak"\n\nresult = check_password_strength("abc123")\nprint(result)',
        hint: 'Check password length and if it contains digits'
      },
      {
        id: 'normal-2',
        title: 'Custom Error Handler',
        description: 'Create a function that raises a custom error for negative numbers',
        type: 'code',
        starterCode: '# Create function with custom error\ndef validate_positive(number):\n    # Add docstring and error handling\n    pass\n\ntry:\n    validate_positive(-5)\nexcept Exception as e:\n    print(str(e))',
        expectedOutput: 'Number must be positive',
        solution: 'def validate_positive(number):\n    """Validate that number is positive"""\n    if number < 0:\n        raise ValueError("Number must be positive")\n    return number\n\ntry:\n    validate_positive(-5)\nexcept Exception as e:\n    print(str(e))',
        hint: 'Use raise ValueError() to create custom errors'
      }
    ]
  },
  {
    id: 4,
    name: 'Hard',
    title: 'Level 4: Hard - 🚨 CYBER ATTACK INITIATED',
    description: 'Welcome to the fire. Cyber Attacks begin.',
    difficulty: 'hard',
    unlocked: false,
    completed: false,
    cyberAttack: true,
    rules: [
      'All answers must use variables (no hardcoding values)',
      'Every loop must terminate (or face the infinite loop animation)',
      'Every function must include a docstring and no global variables allowed'
    ],
    newRules: ['Timed challenges: Fix corrupted code before the system crashes'],
    challenges: [
      {
        id: 'hard-1',
        title: '🚨 SYSTEM BREACH DETECTED',
        description: 'Fix this corrupted input sanitizer before hackers exploit it!',
        type: 'repair',
        starterCode: '# CORRUPTED CODE - FIX IMMEDIATELY\ndef sanitize_input(user_input):\n    """\n    # Remove dangerous characters\n    dangerous = ["<", ">", "&", "script"]\n    for char in dangerous\n        user_input = user_input.replace(char, "")\n    return user_input\n\nclean_input = sanitize_input("<script>alert()")\nprint(clean_input)',
        expectedOutput: 'alert()',
        solution: 'def sanitize_input(user_input):\n    """Remove dangerous characters from user input"""\n    dangerous = ["<", ">", "&", "script"]\n    for char in dangerous:\n        user_input = user_input.replace(char, "")\n    return user_input\n\nclean_input = sanitize_input("<script>alert()")\nprint(clean_input)',
        hint: 'Fix the syntax error in the for loop - missing colon!'
      },
      {
        id: 'hard-2',
        title: '🔐 Encryption Logic Repair',
        description: 'The encryption function is broken! Fix it before sensitive data leaks!',
        type: 'repair',
        starterCode: '# ENCRYPTION SYSTEM COMPROMISED\ndef simple_encrypt(text, shift):\n    """Simple Caesar cipher encryption"""\n    result = ""\n    for char in text:\n        if char.isalpha():\n            shifted = ord(char) + shift\n            result += chr(shifted)\n        else:\n            result += char\n    return result\n\nencrypted = simple_encrypt("hello", 3)\nprint(encrypted)',
        expectedOutput: 'khoor',
        solution: 'def simple_encrypt(text, shift):\n    """Simple Caesar cipher encryption"""\n    result = ""\n    for char in text:\n        if char.isalpha():\n            shifted = ord(char) + shift\n            result += chr(shifted)\n        else:\n            result += char\n    return result\n\nencrypted = simple_encrypt("hello", 3)\nprint(encrypted)',
        hint: 'The code looks correct - run it to see if it works!'
      }
    ]
  },
  {
    id: 5,
    name: 'Very Hard',
    title: 'Level 5: Very Hard',
    description: 'Recursive loops, algorithms, and optimization start here.',
    difficulty: 'veryhard',
    unlocked: false,
    completed: false,
    rules: [
      'All answers must use variables (no hardcoding values)',
      'Every loop must terminate (or face the infinite loop animation)',
      'Every function must include a docstring and no global variables allowed',
      'Timed challenges: Fix corrupted code before the system crashes'
    ],
    newRules: ['No built-in sort functions allowed - implement your own'],
    challenges: [
      {
        id: 'veryhard-1',
        title: 'Palindrome Hunter',
        description: 'Write a recursive function that finds all palindromes in "racecar level deed"',
        type: 'code',
        starterCode: '# Find palindromes recursively\ndef find_palindromes(text):\n    """Find all palindromes in text using recursion"""\n    # Your recursive solution here\n    pass\n\nresult = find_palindromes("racecar level deed")\nprint(result)',
        expectedOutput: "['racecar', 'level', 'deed']",
        solution: 'def find_palindromes(text):\n    """Find all palindromes in text using recursion"""\n    words = text.split()\n    palindromes = []\n    \n    def is_palindrome(word, start=0, end=None):\n        if end is None:\n            end = len(word) - 1\n        if start >= end:\n            return True\n        if word[start] != word[end]:\n            return False\n        return is_palindrome(word, start + 1, end - 1)\n    \n    for word in words:\n        if is_palindrome(word):\n            palindromes.append(word)\n    \n    return palindromes\n\nresult = find_palindromes("racecar level deed")\nprint(result)',
        hint: 'Use recursion to check if each word reads the same forwards and backwards'
      },
      {
        id: 'veryhard-2',
        title: 'Custom Sort Implementation',
        description: 'Implement bubble sort to sort [64, 34, 25, 12, 22, 11, 90]',
        type: 'code',
        starterCode: '# Implement bubble sort\ndef bubble_sort(arr):\n    """Sort array using bubble sort algorithm"""\n    # No built-in sort allowed!\n    pass\n\nnumbers = [64, 34, 25, 12, 22, 11, 90]\nsorted_numbers = bubble_sort(numbers)\nprint(sorted_numbers)',
        expectedOutput: '[11, 12, 22, 25, 34, 64, 90]',
        solution: 'def bubble_sort(arr):\n    """Sort array using bubble sort algorithm"""\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr\n\nnumbers = [64, 34, 25, 12, 22, 11, 90]\nsorted_numbers = bubble_sort(numbers)\nprint(sorted_numbers)',
        hint: 'Compare adjacent elements and swap if they are in wrong order'
      }
    ]
  },
  {
    id: 6,
    name: 'Extreme',
    title: 'Level 6: Extreme',
    description: 'Object-oriented design and abstract logic.',
    difficulty: 'extreme',
    unlocked: false,
    completed: false,
    rules: [
      'All answers must use variables (no hardcoding values)',
      'Every loop must terminate (or face the infinite loop animation)',
      'Every function must include a docstring and no global variables allowed',
      'Timed challenges: Fix corrupted code before the system crashes',
      'No built-in sort functions allowed - implement your own'
    ],
    newRules: ['Each class must override at least one method'],
    challenges: [
      {
        id: 'extreme-1',
        title: 'ATM System Simulation',
        description: 'Create an ATM class that handles deposits and withdrawals with balance tracking',
        type: 'code',
        starterCode: '# Create ATM system using OOP\nclass ATM:\n    """ATM system for banking operations"""\n    def __init__(self, initial_balance=0):\n        # Initialize ATM\n        pass\n    \n    def deposit(self, amount):\n        # Add deposit logic\n        pass\n    \n    def withdraw(self, amount):\n        # Add withdrawal logic\n        pass\n\natm = ATM(100)\natm.deposit(50)\nresult = atm.withdraw(30)\nprint(f"Withdrawal: {result}, Balance: {atm.balance}")',
        expectedOutput: 'Withdrawal: 30, Balance: 120',
        solution: 'class ATM:\n    """ATM system for banking operations"""\n    def __init__(self, initial_balance=0):\n        self.balance = initial_balance\n    \n    def deposit(self, amount):\n        """Deposit money into account"""\n        self.balance += amount\n        return amount\n    \n    def withdraw(self, amount):\n        """Withdraw money from account"""\n        if amount <= self.balance:\n            self.balance -= amount\n            return amount\n        return 0\n    \n    def __str__(self):\n        """Override string representation"""\n        return f"ATM Balance: ${self.balance}"\n\natm = ATM(100)\natm.deposit(50)\nresult = atm.withdraw(30)\nprint(f"Withdrawal: {result}, Balance: {atm.balance}")',
        hint: 'Remember to override a method like __str__ or __repr__'
      }
    ]
  },
  {
    id: 7,
    name: 'Pro',
    title: 'Level 7: Pro',
    description: 'Welcome to functional hell. No side effects allowed.',
    difficulty: 'pro',
    unlocked: false,
    completed: false,
    rules: [
      'All answers must use variables (no hardcoding values)',
      'Every loop must terminate (or face the infinite loop animation)',
      'Every function must include a docstring and no global variables allowed',
      'Timed challenges: Fix corrupted code before the system crashes',
      'No built-in sort functions allowed - implement your own',
      'Each class must override at least one method'
    ],
    newRules: ['No for-loops allowed - use functional programming only'],
    challenges: [
      {
        id: 'pro-1',
        title: 'Functional Data Pipeline',
        description: 'Filter and transform user data [1,2,3,4,5,6] to get squares of even numbers',
        type: 'code',
        starterCode: '# Use functional programming only\ndata = [1, 2, 3, 4, 5, 6]\n\n# Transform using map, filter, lambda - NO for loops!\nresult = # Your functional solution here\nprint(list(result))',
        expectedOutput: '[4, 16, 36]',
        solution: 'data = [1, 2, 3, 4, 5, 6]\n\n# Filter even numbers, then square them\nresult = map(lambda x: x**2, filter(lambda x: x % 2 == 0, data))\nprint(list(result))',
        hint: 'Chain filter() and map() with lambda functions'
      }
    ]
  },
  {
    id: 8,
    name: 'Ultra Pro',
    title: 'Level 8: Ultra Pro',
    description: 'Real-world programming: async code and parallel nightmares.',
    difficulty: 'ultrapro',
    unlocked: false,
    completed: false,
    rules: [
      'All answers must use variables (no hardcoding values)',
      'Every loop must terminate (or face the infinite loop animation)',
      'Every function must include a docstring and no global variables allowed',
      'Timed challenges: Fix corrupted code before the system crashes',
      'No built-in sort functions allowed - implement your own',
      'Each class must override at least one method',
      'No for-loops allowed - use functional programming only'
    ],
    newRules: ['All operations must be thread-safe'],
    challenges: [
      {
        id: 'ultrapro-1',
        title: 'Deadlock Resolution',
        description: 'Fix the deadlocked task manager simulation',
        type: 'repair',
        starterCode: '# DEADLOCK DETECTED - FIX IMMEDIATELY\nimport threading\nimport time\n\nclass TaskManager:\n    """Thread-safe task manager"""\n    def __init__(self):\n        self.lock1 = threading.Lock()\n        self.lock2 = threading.Lock()\n        self.tasks = []\n    \n    def add_task(self, task):\n        """Add task safely"""\n        with self.lock1:\n            time.sleep(0.1)  # Simulate work\n            with self.lock2:\n                self.tasks.append(task)\n    \n    def process_task(self):\n        """Process task safely"""\n        with self.lock2:\n            time.sleep(0.1)  # Simulate work\n            with self.lock1:\n                if self.tasks:\n                    return self.tasks.pop(0)\n        return None\n\n# This will deadlock!\ntm = TaskManager()\nprint("Task manager created")',
        expectedOutput: 'Task manager created',
        solution: 'import threading\nimport time\n\nclass TaskManager:\n    """Thread-safe task manager"""\n    def __init__(self):\n        self.lock = threading.Lock()  # Use single lock to prevent deadlock\n        self.tasks = []\n    \n    def add_task(self, task):\n        """Add task safely"""\n        with self.lock:\n            self.tasks.append(task)\n    \n    def process_task(self):\n        """Process task safely"""\n        with self.lock:\n            if self.tasks:\n                return self.tasks.pop(0)\n        return None\n\ntm = TaskManager()\nprint("Task manager created")',
        hint: 'Use a single lock or acquire locks in consistent order to prevent deadlock'
      }
    ]
  },
  {
    id: 9,
    name: 'Max',
    title: 'Level 9: Max',
    description: 'This is the real deal. Data structures and algorithms warzone.',
    difficulty: 'max',
    unlocked: false,
    completed: false,
    rules: [
      'All answers must use variables (no hardcoding values)',
      'Every loop must terminate (or face the infinite loop animation)',
      'Every function must include a docstring and no global variables allowed',
      'Timed challenges: Fix corrupted code before the system crashes',
      'No built-in sort functions allowed - implement your own',
      'Each class must override at least one method',
      'No for-loops allowed - use functional programming only',
      'All operations must be thread-safe'
    ],
    newRules: ['Implement algorithms from scratch - no library functions'],
    challenges: [
      {
        id: 'max-1',
        title: 'Network Breach - Dijkstra\'s Algorithm',
        description: 'Implement Dijkstra\'s algorithm to find shortest path in network graph',
        type: 'code',
        starterCode: '# Implement Dijkstra\'s algorithm from scratch\ndef dijkstra(graph, start, end):\n    """Find shortest path using Dijkstra\'s algorithm"""\n    # Implement from scratch - no libraries!\n    pass\n\n# Network graph: {node: {neighbor: distance}}\ngraph = {\n    "A": {"B": 4, "C": 2},\n    "B": {"C": 1, "D": 5},\n    "C": {"D": 8, "E": 10},\n    "D": {"E": 2},\n    "E": {}\n}\n\npath_length = dijkstra(graph, "A", "E")\nprint(path_length)',
        expectedOutput: '11',
        solution: 'def dijkstra(graph, start, end):\n    """Find shortest path using Dijkstra\'s algorithm"""\n    distances = {node: float(\'inf\') for node in graph}\n    distances[start] = 0\n    visited = set()\n    \n    while len(visited) < len(graph):\n        # Find unvisited node with minimum distance\n        current = None\n        for node in graph:\n            if node not in visited:\n                if current is None or distances[node] < distances[current]:\n                    current = node\n        \n        if current is None or distances[current] == float(\'inf\'):\n            break\n            \n        visited.add(current)\n        \n        # Update distances to neighbors\n        for neighbor, weight in graph[current].items():\n            distance = distances[current] + weight\n            if distance < distances[neighbor]:\n                distances[neighbor] = distance\n    \n    return distances[end] if distances[end] != float(\'inf\') else -1\n\ngraph = {\n    "A": {"B": 4, "C": 2},\n    "B": {"C": 1, "D": 5},\n    "C": {"D": 8, "E": 10},\n    "D": {"E": 2},\n    "E": {}\n}\n\npath_length = dijkstra(graph, "A", "E")\nprint(path_length)',
        hint: 'Track distances, find minimum unvisited node, update neighbor distances'
      }
    ]
  },
  {
    id: 10,
    name: 'Legendary',
    title: 'Level 10: Legendary',
    description: 'You\'re now in CIA territory. Hackers, spies, and machine overlords.',
    difficulty: 'legendary',
    unlocked: false,
    completed: false,
    rules: [
      'All answers must use variables (no hardcoding values)',
      'Every loop must terminate (or face the infinite loop animation)',
      'Every function must include a docstring and no global variables allowed',
      'Timed challenges: Fix corrupted code before the system crashes',
      'No built-in sort functions allowed - implement your own',
      'Each class must override at least one method',
      'No for-loops allowed - use functional programming only',
      'All operations must be thread-safe',
      'Implement algorithms from scratch - no library functions'
    ],
    newRules: ['All data must be encrypted/decrypted using custom algorithms'],
    challenges: [
      {
        id: 'legendary-1',
        title: '🕵️ Extract Hidden Message',
        description: 'Decode the hidden message from corrupted binary using XOR and base64',
        type: 'decode',
        starterCode: '# CLASSIFIED: Extract hidden message\nimport base64\n\ndef decode_message(encrypted_data, xor_key):\n    """Decode hidden message using XOR and base64"""\n    # Step 1: XOR decode\n    # Step 2: Base64 decode\n    pass\n\n# Encrypted data (base64 encoded after XOR)\nencrypted = "Dg4KDgwOCg4ODg4KDg4ODg4KDg4ODg4K"\nkey = 42\n\nmessage = decode_message(encrypted, key)\nprint(message)',
        expectedOutput: 'TOP SECRET',
        solution: 'import base64\n\ndef decode_message(encrypted_data, xor_key):\n    """Decode hidden message using XOR and base64"""\n    # First decode from base64\n    decoded_bytes = base64.b64decode(encrypted_data)\n    \n    # Then XOR decode\n    xor_decoded = bytes([b ^ xor_key for b in decoded_bytes])\n    \n    return xor_decoded.decode(\'utf-8\')\n\nencrypted = "Dg4KDgwOCg4ODg4KDg4ODg4KDg4ODg4K"\nkey = 42\n\nmessage = decode_message(encrypted, key)\nprint(message)',
        hint: 'First decode base64, then XOR each byte with the key'
      }
    ]
  },
  {
    id: 11,
    name: 'God Mode',
    title: 'Level 11: God Mode 🕵️‍♂️ (Secret)',
    description: 'Unlockable only if all previous levels completed perfectly.',
    difficulty: 'legendary',
    unlocked: false,
    completed: false,
    rules: [
      'All answers must use variables (no hardcoding values)',
      'Every loop must terminate (or face the infinite loop animation)',
      'Every function must include a docstring and no global variables allowed',
      'Timed challenges: Fix corrupted code before the system crashes',
      'No built-in sort functions allowed - implement your own',
      'Each class must override at least one method',
      'No for-loops allowed - use functional programming only',
      'All operations must be thread-safe',
      'Implement algorithms from scratch - no library functions',
      'All data must be encrypted/decrypted using custom algorithms'
    ],
    newRules: ['AI/ML challenges: Detect bias and adversarial inputs'],
    challenges: [
      {
        id: 'godmode-1',
        title: '🤖 AI Bias Detection',
        description: 'Detect and correct bias in a simulated ML model\'s decision making',
        type: 'reverse',
        starterCode: '# CLASSIFIED: AI Ethics Challenge\ndef detect_bias(model_decisions, demographics):\n    """Detect bias in AI model decisions"""\n    # Analyze decision patterns across demographics\n    # Return bias score (0 = no bias, 1 = maximum bias)\n    pass\n\ndef correct_bias(decisions, bias_score):\n    """Correct detected bias in model"""\n    # Implement bias correction algorithm\n    pass\n\n# Simulated model data\ndecisions = [1, 1, 0, 1, 0, 0, 1, 0]  # 1=approved, 0=rejected\ndemographics = ["A", "A", "B", "A", "B", "B", "A", "B"]\n\nbias_score = detect_bias(decisions, demographics)\ncorrected = correct_bias(decisions, bias_score)\nprint(f"Bias detected: {bias_score:.2f}")\nprint(f"Corrected decisions: {corrected}")',
        expectedOutput: 'Bias detected: 0.50\nCorrected decisions: [1, 1, 1, 1, 0, 0, 0, 0]',
        solution: 'def detect_bias(model_decisions, demographics):\n    """Detect bias in AI model decisions"""\n    groups = {}\n    for decision, demo in zip(model_decisions, demographics):\n        if demo not in groups:\n            groups[demo] = []\n        groups[demo].append(decision)\n    \n    # Calculate approval rates per group\n    rates = {}\n    for group, decisions in groups.items():\n        rates[group] = sum(decisions) / len(decisions)\n    \n    # Bias is difference between max and min approval rates\n    bias_score = max(rates.values()) - min(rates.values())\n    return bias_score\n\ndef correct_bias(decisions, bias_score):\n    """Correct detected bias in model"""\n    # Simple bias correction: balance approvals\n    total_approvals = sum(decisions)\n    target_per_half = total_approvals // 2\n    \n    corrected = [1] * target_per_half + [1] * target_per_half + [0] * (len(decisions) - total_approvals)\n    return corrected[:len(decisions)]\n\ndecisions = [1, 1, 0, 1, 0, 0, 1, 0]\ndemographics = ["A", "A", "B", "A", "B", "B", "A", "B"]\n\nbias_score = detect_bias(decisions, demographics)\ncorrected = correct_bias(decisions, bias_score)\nprint(f"Bias detected: {bias_score:.2f}")\nprint(f"Corrected decisions: {corrected}")',
        hint: 'Calculate approval rates for each demographic group and find the difference'
      }
    ]
  }
];

export const getLevel = (levelId: number): GameLevel | undefined => {
  return gameLevels.find(level => level.id === levelId);
};

export const getTotalChallenges = (): number => {
  return gameLevels.reduce((total, level) => total + level.challenges.length, 0);
};

export const unlockNextLevel = (currentLevelId: number): void => {
  const nextLevel = gameLevels.find(level => level.id === currentLevelId + 1);
  if (nextLevel) {
    nextLevel.unlocked = true;
  }
};

export const isSecretLevelUnlocked = (): boolean => {
  // God Mode (Level 11) unlocks only if all previous levels are completed perfectly
  const regularLevels = gameLevels.slice(0, 11); // Levels 0-10
  return regularLevels.every(level => level.completed);
};