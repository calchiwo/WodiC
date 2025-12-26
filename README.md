# WodiC, The Voice Calculator

WodiC is an AI voice scientific calculator i built entirely on my phone.

I've always wanted a calculator that you can speak your math problems to, and it solves it instantly, even offline.

try it here: **https://wodic.vercel.app**

---

## Overview

WodiC Voice Calculator app captures spoken math input using the Web Speech API, converts speech to text in real time, then parses the text into a structured mathematical expression. That expression flows through a deterministic evaluation layer that handles arithmetic, scientific functions, and constants without relying on a backend service.

Computation happens locally on the device. This design enables full offline support once the app is installed.

After evaluation, WodiC renders the formatted equation and result instantly in the UI. The result is also converted back to speech using browser native speech synthesis, allowing hands free interaction from input to output.

WodiC runs on Next.js with the App Router and ships as a Progressive Web App. Assets, logic, and UI cache locally through the service worker, enabling fast loads and offline usage on both mobile and desktop.

The system prioritizes low latency, privacy, and reliability by keeping the entire voice to compute to response loop client side.

---

## Features

- Voice input  
- Instant results  
- Scientific mode  
- Dark mode  
- Natural voice replies  
- Lightweight performance  
- Works offline  
- Installable as a PWA  

---

## Tech Stack

- Next.js, React
- Typescript
- Tailwind CSS, PostCSS 
- Web Speech API
- pnpm 
- Vercel deployment  

---

## Usage

1. Visit https://wodic.vercel.app  
2. Allow microphone access  
3. Speak a command  
4. WodiC displays the equation and speaks the result  
5. Tap the install option in your browser to add the PWA

---

## Example Commands

| You Say | WodiC Replies |
|--------|----------------|
| What is fifty plus forty | The answer is ninety |
| Square root of eighty one | The answer is nine |
| Cosine of thirty degrees | The answer is zero point eight six six |
| Ten factorial | The answer is three million six hundred twenty eight thousand eight hundred |

---

## Roadmap

- Voice input with instant results, complete  
- Scientific mode, complete  
- Full offline support, complete  
- PWA installation, complete  
- History log, complete  
- AI explanation mode  
- Improved UI and UX  
- Better error handling  
- More input formats  
- Expanded documentation  

---

## How to Run

Follow these steps to run this Next.js project on your computer or phone.

1. **Clone the repository**

```bash
git clone https://github.com/calchiwo/WodiC.git
```

2. **Open the project folder**

```bash
cd WodiC
```

3. **Install dependencies**

```bash
pnpm install
```

Or If you use npm

```bash
npm install
```

4. **Run the development server**

```bash
pnpm dev
```

Or with npm

```bash
npm run dev
```

5. **Open the app**

Visit this URL in your browser.

```
http://localhost:3000
```

## License

This project is **open source** under the [MIT License](LICENSE)

## Contributing

Contributions are welcome!

## Author

- **Caleb Wodi**
- [Twitter](https://x.com/calchiwo)
- [LinkedIn](https://www.linkedin.com/in/calchiwo)
