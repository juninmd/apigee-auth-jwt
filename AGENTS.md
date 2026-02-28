```markdown
# AGENTS.md File Guidelines

These guidelines are designed to ensure the consistent, high-quality development of AGENTS.md, a repository for AI coding agents. Adherence to these principles is mandatory for all development activities.

## 1. DRY (Don't Repeat Yourself)

*   **Code Reuse:**  Strive for reusable components and functions across multiple agents.  Avoid creating duplicated logic.
*   **Single Responsibility Principle:** Each agent should have a clearly defined, focused purpose.  Changes should not inadvertently impact other agents.
*   **Abstraction:**  Utilize abstract classes or interfaces where appropriate to promote modularity and reduce code duplication.

## 2. KISS (Keep It Simple, Stupid)

*   **Simple Solutions:** Favor straightforward, easily understandable solutions over complex ones.
*   **Minimalism:**  Avoid unnecessary complexity in design and implementation.  Keep code concise and focused.
*   **Readability:** Prioritize code that is easily readable and understandable, even by someone unfamiliar with the codebase.

## 3. SOLID Principles

*   **Single Responsibility:** Each class, function, or module should have one primary responsibility.
*   **Open/Closed Principle:**  The system should be extensible without modifying the existing code.  New functionality should be added through new classes/functions, not through modification of the core code.
*   **Liskov Substitution Principle:**  Subclasses should be substitutable for their base classes without altering the correctness of the system.
*   **Interface Segregation Principle:** Clients shouldn't be forced to implement interfaces they don't use.
*   **Dependency Inversion Principle:** Interfaces should be used as a substitute for concrete classes.

## 4. YAGNI (You Aren't Gonna Need It)

*   **Avoid Unnecessary Features:**  Do not implement features that are not currently required or are unlikely to be needed in the future.
*   **Focus on Core Functionality:**  Concentrate on providing the essential functionality for each agent.  Future enhancements should be considered carefully.

## 5. Development Process & Best Practices

*   **Code Style:**  Adhere to a consistent code style guide (e.g., PEP 8 for Python).  Use a linter to enforce style automatically.
*   **Documentation:**  Write clear and concise documentation for all functions, classes, and modules.  Use docstrings effectively.
*   **Testing:**  All development MUST be productive.  Tests should be thorough, covering all key functionalities and edge cases.
*   **Version Control:**  Use a version control system (e.g., Git) with clear branching strategies.
*   **Code Review:**  All changes must undergo a code review before being merged.
*   **Error Handling:**  Implement proper error handling and logging to facilitate debugging and monitoring.
*   **Security Considerations:** Implement basic security measures such as input validation and secure coding practices.

## 6. File Length Constraints

*   **Maximum Code:** 180 lines of code per file.
*   **Lines per File:**  Maximum 180 lines of code for each file.

## 7. Test Coverage Requirements

*   **Minimum:** 80% test coverage across all files.  This requires automated test suites for critical functionalities.

## 8. Data Structures & Algorithms

*   Utilize appropriate data structures for efficient data manipulation.  Choose algorithms based on performance requirements.  Avoid overly complex data structures unless necessary.

## 9. Framework & Libraries

*   Utilize established AI frameworks (e.g., TensorFlow, PyTorch) where appropriate.  Ensure compatibility with existing code.  Use libraries for essential tasks.

## 10.  Comments

*   Write concise, informative comments explaining complex logic or design decisions.  Ensure comments are clear and directly related to the code.
```