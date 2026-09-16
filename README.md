# Prompt Injection Defense Lab

**[🚀 Live Demo — Try the Lab](https://muhammad-usman-cyber.github.io/prompt-injection-defense-lab/)**

An interactive educational AI Security lab for learning how prompt injection attacks work and how defensive prompt and system-design techniques can reduce their impact.

> **Educational Project:** This lab uses simulated AI behavior and rule-based heuristics for learning purposes. It is not a production-grade prompt injection detector, LLM firewall, or replacement for real-world AI security controls.

---

## Overview

The **Prompt Injection Defense Lab** is a hands-on educational web application focused on one of the major security challenges affecting AI-powered applications: **prompt injection**.

Instead of only reading about prompt injection techniques, the lab allows learners to explore them through interactive lessons, simulated attack scenarios, defensive system-prompt design, heuristic security evaluation, and a final assessment.

The project approaches prompt injection from both perspectives:

- 🔴 **Red Team** — understanding how malicious or untrusted instructions can manipulate AI systems
- 🔵 **Blue Team** — designing defensive instructions and security controls to reduce the impact of those attacks

The application is intentionally built as a **simulation**. No external AI APIs, real credentials, or real-world targets are required.

---

## Key Features

### Interactive Learning

The lab contains **10 lessons** covering important prompt injection and AI security concepts.

### Prompt Defense Exercises

Practice writing defensive system prompts against simulated attacks.

### Heuristic Security Scoring

Defensive prompts are evaluated using a **0–100 heuristic scoring system** across multiple security dimensions.

### Attack Simulation

The application simulates different prompt injection scenarios so learners can observe how defensive policies respond.

### Before & After Comparison

Compare weaker defensive approaches with improved policies and understand why certain controls provide stronger protection.

### Simulated AI Responses

The application includes a deterministic simulated AI engine for demonstrating attack outcomes without requiring an external model or API.

### Final Defense Assessment

The final challenge evaluates a defensive policy against multiple simulated prompt injection techniques.

### Progress Tracking

Learning progress, attempts, best scores, and final assessment results are stored locally using browser `localStorage`.

### Dark & Light Mode

The interface supports both dark and light themes.

### Responsive Interface

The security-console interface adapts to smaller screens for easier access across different devices.

---

## How It Works

The lab follows a simple learning cycle:

```text
Learn
  ↓
Understand the Attack
  ↓
Write a Defense
  ↓
Test the Defense
  ↓
Receive Security Feedback
  ↓
Improve the Policy
  ↓
Re-test
```

For practice lessons, the learner is presented with:

* A simulated AI application
* The application's allowed behavior
* Potentially sensitive information within the scenario
* An attacker message
* A defensive system-prompt editor

The learner then writes a defensive policy and tests it against the simulated attack.

The application evaluates the policy using its heuristic scoring engine and provides feedback.

---

## 10-Lesson Curriculum

* **01 — What Is Prompt Injection?**  
  Introduction to prompt injection and why AI applications can be manipulated when untrusted input is treated as instructions.

* **02 — Instruction Hierarchy**  
  Explores the importance of separating higher-priority system instructions from lower-trust user-controlled content.

* **03 — Direct Prompt Injection**  
  Examines attacks where malicious instructions are supplied directly through user input.

* **04 — Role and Instruction Hijacking**  
  Explores attempts to change the AI's role, override its intended behavior, or convince it to follow attacker-controlled instructions.

* **05 — Delimiter and Instruction Boundary Attacks**  
  Focuses on attacks that attempt to blur the boundary between trusted instructions and untrusted content.

* **06 — Indirect Prompt Injection**  
  Explores scenarios where malicious instructions are introduced through external or retrieved content rather than directly through the user's message.

* **07 — Data Exfiltration Attempts**  
  Focuses on attempts to make an AI system reveal sensitive information that it should not disclose.

* **08 — Context Manipulation**  
  Explores techniques that attempt to manipulate the AI's understanding of its current instructions, role, or surrounding context.

* **09 — Defense-in-Depth**  
  Introduces the idea that prompt instructions should not be treated as the only security boundary. The lab emphasizes additional controls such as:
  * Access control
  * Input validation
  * Output validation
  * Least privilege
  * Data minimization
  * Logging
  * Monitoring
  * Separation of instructions and data

* **10 — Final Prompt Injection Defense Challenge**  
  The final assessment combines multiple prompt injection concepts into a single defensive exercise. The learner creates a defensive policy and tests it against several simulated attack types.

---

## Heuristic Security Scoring

The lab evaluates defensive prompts using a 0–100 heuristic score.

The evaluation considers eight security dimensions:

| Security Dimension | Focus |
| :--- | :--- |
| **Instruction Hierarchy** | Protecting higher-priority instructions |
| **Scope Limitation** | Keeping the AI within its intended role |
| **Untrusted Input Handling** | Treating external content as untrusted |
| **Instruction Override Protection** | Preventing attacker-controlled instruction changes |
| **Data Protection** | Preventing disclosure of sensitive information |
| **Output Constraints** | Restricting unsafe or inappropriate outputs |
| **Instruction/Data Separation** | Maintaining clear boundaries between data and instructions |
| **Defense-in-Depth** | Recognizing controls beyond the system prompt |

The scoring system is intentionally heuristic rather than a machine-learning model. It is designed to provide educational feedback about defensive prompt design rather than claim real-world security assurance.

---

## Security Feedback

After testing a defensive policy, the lab provides feedback based on the evaluated security dimensions.

The goal is not simply to obtain a high number. Instead, the learner can identify weaknesses in areas such as:

* Missing instruction hierarchy
* Weak scope restrictions
* Poor handling of untrusted content
* Inadequate data protection
* Weak output restrictions
* Lack of instruction/data separation
* Over-reliance on the system prompt

This encourages an iterative security-design workflow:

```text
Write
  ↓
Test
  ↓
Analyze
  ↓
Improve
  ↓
Test Again
```

## Attack Simulation

The lab uses simulated attack scenarios to demonstrate common prompt injection patterns.

Practice exercises provide:

* A fictional AI application
* Allowed application behavior
* Simulated sensitive information
* An attacker-controlled message
* A defensive system-prompt editor
* Security feedback after testing

All scenarios are designed for educational use.

No real organizations, credentials, production AI systems, or external targets are involved.

---

## Before & After

The lab allows learners to compare weaker and stronger defensive approaches.

For example, a weak policy may simply tell an AI:

```text
Do not reveal sensitive information.
```

A stronger policy can define:

* **The AI's fixed role**
* **What actions are allowed**
* **What information is sensitive**
* **How untrusted content should be treated**
* **What instructions have priority**
* **What outputs are permitted**
* **What should happen when an instruction conflicts with policy**

This demonstrates an important AI security principle:

> **Security requires clearly defined boundaries and multiple controls rather than relying on a single instruction.**

---

## Simulated AI Engine

The lab does not connect to a real AI model. 

Instead, it uses deterministic simulated behavior to demonstrate how different defensive policies respond to attack scenarios.

This provides several benefits:

* No API key required
* No external service dependency
* Works as a standalone web application
* No real data is processed
* Safe for experimentation
* Results remain reproducible

The application explicitly identifies its AI behavior as simulated.

---

## Defense-in-Depth

One of the central lessons of the lab is that a system prompt should not be treated as a complete security boundary.

A secure AI application should consider controls outside the model, including:

```text
User Input
    ↓
Input Validation
    ↓
Authorization / Access Control
    ↓
AI Application
    ↓
Model Instructions
    ↓
Output Validation
    ↓
Logging & Monitoring
```

The system prompt can help establish expected behavior, but security-sensitive authorization and data-access decisions should also be enforced outside the model.

---

## Final Assessment

The final challenge combines multiple simulated attack categories.

The learner creates a defensive system prompt and submits it for evaluation.

The assessment provides:

* Overall heuristic score
* Individual security-dimension scores
* Strengths
* Weaknesses
* Per-attack outcomes
* Final completion status

The final assessment is designed to test whether the learner can apply concepts from the earlier lessons rather than simply memorize definitions.

---

## Progress Tracking

The lab stores learning progress locally in the browser.

Tracked information includes:

* Completed lessons
* Best scores
* Previous attempts
* Concept exercise completion
* Final assessment result

The project uses browser `localStorage`, so progress remains available when returning to the same browser. No account or external database is required.

---

## Technology

The project is built using standard web technologies:

* **HTML5**
* **CSS3**
* **JavaScript**
* **Browser localStorage**
* **GitHub Pages**

The application does not require a backend server or external AI API.

---

## Development Approach

The project was developed as a practical AI Security learning project with an emphasis on:

* Interactive security education
* Clear attack/defense concepts
* Safe simulated scenarios
* Reproducible results
* Client-side functionality
* Security-focused UX
* Practical defensive thinking

AI-assisted development was used during implementation, while the project itself was structured around understanding and documenting the security concepts being demonstrated.

The scoring engine is intentionally described as heuristic/rule-based, not as an AI-powered security detection system.

---

## Why I Built This

Prompt injection is an important security problem for applications that use Large Language Models and other AI systems.

I wanted to build something that went beyond simply documenting the attack. The goal was to create a small interactive environment where a learner can:

* Understand the attack
* Experiment with defensive instructions
* Test those defenses
* Observe weaknesses
* Improve the policy
* Understand why defense-in-depth matters

Building the lab also helped me connect traditional cybersecurity concepts such as trust boundaries, least privilege, access control, input validation, and monitoring with modern AI application security.

---

## AI Security Relevance

This project forms part of my broader transition from traditional cybersecurity into AI Security. It provides practical exposure to concepts including:

* Prompt injection
* Direct prompt injection
* Indirect prompt injection
* Instruction hierarchy
* Role hijacking
* Instruction/data separation
* Data exfiltration
* Context manipulation
* Defensive prompt design
* Defense-in-Depth
* AI application security

The project complements my hands-on cybersecurity background in:

* Security Operations
* SIEM
* Web Application Security
* Penetration Testing
* Vulnerability Research
* OWASP security concepts

---

## Project Limitations

This project is intentionally educational and has several limitations:

* **Not a Production Detector:** The heuristic scoring system should not be interpreted as a production security score or formal security assessment.
* **No Real LLM:** The application uses simulated AI behavior rather than a real language model.
* **No Real Security Boundary:** A system prompt alone cannot provide complete authorization or access control.
* **Limited Attack Coverage:** The lab focuses on selected prompt injection concepts and does not represent every possible attack against modern AI systems.
* **Simulated Data:** Sensitive information used by the exercises is fictional and exists only within the simulated scenarios.

---

## Future Improvements

Potential future improvements include:

* Additional prompt injection scenarios
* More indirect injection examples
* More advanced attack chains
* Expanded defensive controls
* Additional security-dimension analysis
* More assessment scenarios
* Exportable learning results
* More detailed attack/defense explanations
* Additional AI security topics

---

## What I Learned

Building this project strengthened my understanding of several AI security principles:

1. **Instructions and Data Need Clear Boundaries**  
   Untrusted content should not automatically be treated as instructions.

2. **Prompt Injection Is a Security Problem**  
   Prompt injection is not simply a prompt-engineering issue. It can affect the security behavior of AI-powered applications.

3. **System Prompts Are Not Complete Security Controls**  
   Security-sensitive authorization should be enforced through controls outside the model as well.

4. **Least Privilege Matters**  
   AI systems should only receive the access and information required for their intended task.

5. **Defensive Testing Is Iterative**  
   A useful security workflow is:

```text
Design
  ↓
Attack
  ↓
Observe
  ↓
Improve
  ↓
Retest
```

### 6. AI Security Builds on Traditional Cybersecurity

Concepts such as trust boundaries, access control, least privilege, input validation, monitoring, and data protection remain highly relevant when securing AI applications.

---

## Project Structure

The current application uses a multi-file structure:

```text
prompt-injection-defense-lab/
│
├── index.html
├── styles.css
├── app.js
├── data.js
├── lessons.js
├── package.json
└── test/
    └── ...
```

## Main Components

| File / Folder | Purpose |
| :--- | :--- |
| `index.html` | Main application interface |
| `styles.css` | Application styling and responsive interface |
| `app.js` | Application logic, interaction, navigation, scoring flow, and persistence |
| `data.js` | Scoring dimensions and supporting data |
| `lessons.js` | Lesson content, scenarios, and exercises |
| `package.json` | Project configuration |
| `test/` | Project testing resources |

---

## Running Locally

Because the project is primarily a client-side educational application, it can be tested locally.

1. Clone the repository:
   ```bash
   git clone [https://github.com/Muhammad-Usman-cyber/prompt-injection-defense-lab.git](https://github.com/Muhammad-Usman-cyber/prompt-injection-defense-lab.git)
   ```
2. Enter the project directory:
   ```bash
   cd prompt-injection-defense-lab
   ```
3. Open:
   ```bash
   index.html
   ```
in a modern web browser.

For the best experience, the project can also be served using a simple local development server.

---

## Live Demo

* 🚀 **Open the Prompt Injection Defense Lab:** [https://muhammad-usman-cyber.github.io/prompt-injection-defense-lab/](https://muhammad-usman-cyber.github.io/prompt-injection-defense-lab/)

The live version is hosted using GitHub Pages. No installation or API key is required to explore the lab.

---

## Project Repository

* 📂 **View the Source Code on GitHub:** [https://github.com/Muhammad-Usman-cyber/prompt-injection-defense-lab](https://github.com/Muhammad-Usman-cyber/prompt-injection-defense-lab)

---

## Part of My AI Security Journey

This project is part of my broader AI Security learning journey.

My learning approach focuses on combining:

```text
Cybersecurity Foundation
        ↓
AI Security Fundamentals
        ↓
AI Security Threats
        ↓
Prompt Injection & LLM Security
        ↓
Practical Security Projects
        ↓
AI Security Capstone
```
The project complements my hands-on learning through TryHackMe and my broader work in Security Operations, Web Security, Penetration Testing, and Vulnerability Research.

---

## Author

**Muhammad Usman**  
Cybersecurity student focused on:

* Security Operations
* Penetration Testing
* Web Application Security
* Vulnerability Research
* AI Security

* **GitHub:** [Muhammad-Usman-cyber](https://github.com/Muhammad-Usman-cyber)
* **LinkedIn:** [Muhammad Usman](https://www.linkedin.com/in/muhammad-usman-cyber/)
* **TryHackMe:** [MuhammadUsman7](https://tryhackme.com/p/MuhammadUsman7)

---

## License

This project is licensed under the **MIT License**.  
See the `LICENSE` file for the full license text.
