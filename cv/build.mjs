// Builds the master CV as two A4 PDFs (English and German) into public/.
// Usage: node cv/build.mjs
// Needs Chrome or Edge installed (used headless to print HTML to PDF).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const out = join(here, 'out');
mkdirSync(out, { recursive: true });

const photo = `data:image/jpeg;base64,${readFileSync(join(here, 'photo.jpg')).toString('base64')}`;
const GH = 'https://github.com/SomanthaManuranga';

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */
const contact = {
  name: 'Somantha Manuranga',
  phone: '+49 174 7656939',
  email: 'somanthamanuranga@gmail.com',
  linkedin: 'linkedin.com/in/somantha-manuranga-b73432192',
  github: 'github.com/SomanthaManuranga',
  portfolio: 'somanthamanuranga.github.io/portfolio',
};

const en = {
  lang: 'en',
  file: 'Somantha_Manuranga_CV.pdf',
  docTitle: 'Curriculum Vitae',
  title: 'AI Engineer · M.Sc. Student, Artificial Intelligence for Industrial Applications',
  facts: [
    ['Location', 'Amberg, Bavaria, Germany'],
    ['Nationality', 'Sri Lankan'],
    ['Phone', contact.phone],
    ['Email', contact.email],
  ],
  labels: { present: 'present', asOf: 'As of November 2026', page: 'Page' },
  sections: {
    profile: 'Profile',
    work: 'Work Experience',
    education: 'Education',
    projects: 'Selected Projects',
    skills: 'Technical Skills',
    languages: 'Languages',
    certs: 'Certifications & Training',
    more: 'Talks, Activities & Interests',
  },
  profile:
    'M.Sc. student in Artificial Intelligence for Industrial Applications (OTH Amberg-Weiden) with a B.Sc. in Mechanical Engineering and industry experience in aviation design and production automation. Focus on computer vision, LLMs/NLP and AI for industrial processes. I build models that hold up outside the notebook: carefully evaluated, explainable and small enough to deploy.',
  work: [
    {
      when: '10/2026 – present',
      role: 'Working Student (Werkstudent)',
      org: 'syskomp gehmeyr GmbH · Amberg, Germany · part-time',
      points: [
        'Apply AI methods to engineering and industrial workflows in a mechanical engineering environment.',
        'Build and evaluate Python prototypes with an emphasis on traceable, validated results.',
        'Work with engineering colleagues to turn requirements into practical AI tooling.',
      ],
    },
    {
      when: '08/2023 – 09/2024',
      role: 'Design Engineer',
      org: 'KNSI Aviation Engineering · Negombo, Sri Lanka · full-time',
      points: [
        'Managed compliance data workflows and technical documentation with SQL and Excel to aviation standards.',
        'Built automated SQL/Excel reporting templates that cut weekly reporting time by 30 %.',
        'Analysed production data to optimise workflows, raising process efficiency by 40 %.',
        'Led the digitalisation of legacy documentation for faster cross-department data access.',
      ],
    },
    {
      when: '02/2022 – 11/2022',
      role: 'Internship Trainee, Mechatronics & Data',
      org: 'CBL Group (Ceylon Biscuits Limited) · Pannipitiya, Sri Lanka · internship',
      points: [
        'Contributed to process optimisation through data-driven solutions and automation projects.',
        'Supported end-of-line automation with articulated and parallel robots.',
        'Designed and prototyped 3D-printed automation components, reducing external sourcing costs and lead times.',
      ],
    },
  ],
  education: [
    {
      when: '03/2025 – present',
      role: 'M.Sc. Artificial Intelligence for Industrial Applications',
      org: 'OTH Amberg-Weiden · Amberg, Germany · graduation expected 2027',
      points: [
        'Modules: Computer Vision, Deep Vision, Deep Learning, NLP & Information Retrieval, Autonomous Robotics, AI Security & Privacy, Machine Learning.',
      ],
    },
    {
      when: '10/2024 – 02/2025',
      role: "Preparation for Master's studies in Germany",
      org: 'Visa process, relocation to Germany, German language course',
      points: [],
    },
    {
      when: '11/2019 – 05/2023',
      role: 'B.Sc. (Hons) Mechanical Engineering, Minor in Mechatronics',
      org: 'University of Sri Jayewardenepura · Sri Lanka · GPA 3.27 / 4.0',
      points: [
        'Thesis: CNN surrogate model that predicts the aerodynamic drag of 2D shapes from images (replaces CFD runs).',
        'Project: design and build of a CoreXY 3D printer integrating mechanical design and machine learning.',
      ],
    },
  ],
  projects: [
    {
      when: '2026',
      name: 'Removing Jailbreak Backdoors from LLMs',
      repo: 'llm-backdoor-defense-hybrid-sft',
      text: 'Removed a known backdoor from Qwen2.5-1.5B with four-group hybrid supervised fine-tuning (LoRA) on one 8 GB GPU: attack success rate 95 % → 1.7 % at 84 % benign accuracy; probes show the trigger is hidden, not erased.',
      tech: 'PyTorch · Hugging Face · PEFT/LoRA',
    },
    {
      when: '2026',
      name: 'Pneumonia Detection: CNN vs ViT vs Hybrid',
      repo: 'pneumonia-cnn-vit-hybrid-comparison',
      text: 'Compared ResNet-50, ViT-Base and TinyViT under identical conditions (5-fold CV ensembles): TinyViT reached 94.9 % test accuracy (F1 0.948); assessed how faithful the Grad-CAM explanations are.',
      tech: 'PyTorch · timm · Grad-CAM',
    },
    {
      when: '2026',
      name: 'X-ray Casting Defect Detection',
      repo: 'xray-casting-defect-detection-yolov8',
      text: 'Fine-tuned YOLOv8n on GDXray castings with a series-level split: test mAP50 0.545, precision 0.748; failure analysis by defect size; ONNX export running at 60 ms per image on CPU.',
      tech: 'YOLOv8 · OpenCV · ONNX',
    },
    {
      when: '2025/26',
      name: 'QuantumCircuit Dataset Builder',
      repo: 'QuantumCircuit-Dataset-Builder-Automated-Image-to-Text-Pipeline',
      text: 'Automated arXiv mining pipeline with a fine-tuned SciBERT caption classifier (F1 0.954) that produced 250 metadata records and 160 extracted circuit images for image-to-text training.',
      tech: 'Transformers · BeautifulSoup · PyMuPDF',
    },
    {
      when: '2026',
      name: 'LayoutLMv3 Form Understanding',
      repo: 'layoutlmv3-funsd-form-understanding',
      text: 'Fine-tuned LayoutLMv3 for key-value extraction from scanned forms (FUNSD): entity-level F1 0.896, with a Tesseract OCR path for unannotated documents.',
      tech: 'LayoutLMv3 · Hugging Face · Tesseract',
    },
    {
      when: '2025/26',
      name: 'Stacking Ensemble & Edge-Ready Rule Model',
      repo: 'Machine-Learning-Challenge',
      text: 'Optuna-tuned XGBoost/LightGBM/CatBoost stack reaching R² 0.848 on 273 features; reverse-engineered three if-else rules (R² 0.915) that run on an edge device without ML libraries.',
      tech: 'scikit-learn · XGBoost · Optuna',
    },
    {
      when: '2025/26',
      name: 'Autonomous Robotics & Digital Twin',
      repo: 'webots-rosbot-maze-navigation',
      text: 'ROSbot that explores unknown mazes with LiDAR/depth SLAM, frontier exploration, A* and PID (4 of 5 mazes completed); hospital delivery digital twin with TurtleBot3, MQTT and a Flask control centre.',
      tech: 'Webots · SLAM · MQTT',
    },
    {
      when: '2023',
      name: 'CNN Surrogate for Aerodynamic Drag (B.Sc. thesis)',
      repo: 'cnn-drag-prediction-2d-shapes',
      text: 'CNN that predicts the drag coefficient of 2D shapes from images, trained on 12,000 simulated shapes: 0.06–2.77 % relative error on real shapes including NACA airfoils.',
      tech: 'TensorFlow/Keras · CFD',
    },
  ],
  skills: [
    ['Programming', 'Python (advanced), C++, SQL, Git/GitHub, REST APIs, pytest, Linux/Bash'],
    ['ML & Deep Learning', 'PyTorch, TensorFlow/Keras, scikit-learn, XGBoost, LightGBM, CatBoost, Optuna'],
    ['Computer Vision', 'OpenCV, YOLOv8, U-Net, DeepLabV3+, Vision Transformers, Grad-CAM, ONNX'],
    ['NLP & Generative AI', 'Hugging Face Transformers, LLM fine-tuning (LoRA/PEFT), RAG, LangChain, SciBERT, LayoutLMv3'],
    ['Robotics & Engineering', 'Webots, SLAM, path planning (A*), PID control, MQTT, digital twins, CAD/CAM, CFD'],
    ['Data & Tools', 'pandas, NumPy, MongoDB, Power BI, Flask, Jupyter, Weights & Biases, LaTeX'],
  ],
  languages: [
    ['English', 'C1 · professional working level'],
    ['German', 'B1 · actively improving'],
    ['Sinhala', 'Native language'],
  ],
  certs: [
    ['09/2025', 'Bavarian–Czech AI Summer School: “Controlling Robots with LLMs” (32 h) · Speinshart, Germany'],
    ['', 'Deep Learning Specialization · DeepLearning.AI (Coursera)'],
    ['', 'Natural Language Processing Specialization (4 courses) · DeepLearning.AI'],
    ['', 'AI for Medicine Specialization (3 courses) · DeepLearning.AI'],
  ],
  more: [
    ['Talk', 'Adaptive-RAG (NAACL 2024): 25-minute scientific talk, AI Conference module, OTH Amberg-Weiden, summer 2026.'],
    ['Entrepreneurship', 'VYROBA TECHS: designed and built a CoreXY 3D printer and ran a small custom-parts business during the pandemic.'],
    ['Football', 'Player at FC Amberg; former captain of the faculty and university teams; University Colours Award 2022.'],
  ],
};

const de = {
  lang: 'de',
  file: 'Somantha_Manuranga_Lebenslauf.pdf',
  docTitle: 'Lebenslauf',
  title: 'AI Engineer · Masterstudent, Künstliche Intelligenz für industrielle Anwendungen',
  facts: [
    ['Wohnort', 'Amberg, Bayern'],
    ['Nationalität', 'Sri-lankisch'],
    ['Telefon', contact.phone],
    ['E-Mail', contact.email],
  ],
  labels: { present: 'heute', asOf: 'Stand: November 2026', page: 'Seite' },
  sections: {
    profile: 'Profil',
    work: 'Berufserfahrung',
    education: 'Bildungsweg',
    projects: 'Ausgewählte Projekte',
    skills: 'Fachkenntnisse',
    languages: 'Sprachen',
    certs: 'Weiterbildung & Zertifikate',
    more: 'Vorträge, Engagement & Interessen',
  },
  profile:
    'Masterstudent im Studiengang Artificial Intelligence for Industrial Applications (OTH Amberg-Weiden) mit Bachelorabschluss im Maschinenbau und Berufserfahrung in der Luftfahrtkonstruktion und Produktionsautomatisierung. Schwerpunkte: Computer Vision, LLMs/NLP und KI für industrielle Prozesse. Ich entwickle Modelle, die sich außerhalb des Notebooks bewähren: sorgfältig evaluiert, erklärbar und schlank genug für den produktiven Einsatz.',
  work: [
    {
      when: '10/2026 – heute',
      role: 'Werkstudent',
      org: 'syskomp gehmeyr GmbH · Amberg · Teilzeit',
      points: [
        'Anwendung von KI-Methoden auf Engineering- und Industrieprozesse im Maschinenbauumfeld.',
        'Entwicklung und Evaluierung von Python-Prototypen mit Fokus auf nachvollziehbare, validierte Ergebnisse.',
        'Zusammenarbeit mit den Fachabteilungen, um Anforderungen in praxistaugliche KI-Werkzeuge umzusetzen.',
      ],
    },
    {
      when: '08/2023 – 09/2024',
      role: 'Design Engineer (Konstruktionsingenieur)',
      org: 'KNSI Aviation Engineering · Negombo, Sri Lanka · Vollzeit',
      points: [
        'Pflege von Compliance-Daten und technischer Dokumentation mit SQL und Excel nach Luftfahrtstandards.',
        'Automatisierte SQL-/Excel-Berichtsvorlagen entwickelt und den wöchentlichen Reporting-Aufwand um 30 % reduziert.',
        'Produktionsdaten analysiert und Abläufe optimiert; Prozesseffizienz um 40 % gesteigert.',
        'Digitalisierung der Altdokumentation für schnelleren abteilungsübergreifenden Datenzugriff geleitet.',
      ],
    },
    {
      when: '02/2022 – 11/2022',
      role: 'Praktikant (Internship Trainee), Mechatronik & Daten',
      org: 'CBL Group (Ceylon Biscuits Limited) · Pannipitiya, Sri Lanka · Praktikum',
      points: [
        'Mitarbeit an der Prozessoptimierung durch datengetriebene Lösungen und Automatisierungsprojekte.',
        'Unterstützung der End-of-Line-Automatisierung mit Knickarm- und Parallelrobotern.',
        '3D-gedruckte Automatisierungskomponenten konstruiert und als Prototypen gefertigt; externe Beschaffungskosten und Lieferzeiten gesenkt.',
      ],
    },
  ],
  education: [
    {
      when: '03/2025 – heute',
      role: 'M.Sc. Artificial Intelligence for Industrial Applications',
      org: 'OTH Amberg-Weiden · Amberg · Abschluss voraussichtlich 2027',
      points: [
        'Module: Computer Vision, Deep Vision, Deep Learning, NLP & Information Retrieval, Autonome Robotik, AI Security & Privacy, Machine Learning.',
      ],
    },
    {
      when: '10/2024 – 02/2025',
      role: 'Vorbereitung auf das Masterstudium in Deutschland',
      org: 'Visumverfahren, Umzug nach Deutschland, Deutschkurs',
      points: [],
    },
    {
      when: '11/2019 – 05/2023',
      role: 'B.Sc. (Hons) Maschinenbau, Nebenfach Mechatronik',
      org: 'University of Sri Jayewardenepura · Sri Lanka · GPA 3,27 / 4,0',
      points: [
        'Abschlussarbeit: CNN-Surrogatmodell zur Vorhersage des aerodynamischen Widerstands von 2D-Geometrien aus Bildern (ersetzt CFD-Simulationen).',
        'Projekt: Konstruktion und Bau eines CoreXY-3D-Druckers mit Verbindung von mechanischem Design und Machine Learning.',
      ],
    },
  ],
  projects: [
    {
      when: '2026',
      name: 'Entfernen von Jailbreak-Backdoors aus LLMs',
      repo: 'llm-backdoor-defense-hybrid-sft',
      text: 'Bekannte Backdoor aus Qwen2.5-1.5B per hybridem Supervised Fine-Tuning mit vier Datengruppen (LoRA) auf einer 8-GB-GPU entfernt: Angriffserfolgsrate 95 % → 1,7 % bei 84 % Benign Accuracy; Probing zeigt, dass der Trigger verborgen, aber nicht gelöscht ist.',
      tech: 'PyTorch · Hugging Face · PEFT/LoRA',
    },
    {
      when: '2026',
      name: 'Pneumonie-Erkennung: CNN vs. ViT vs. Hybrid',
      repo: 'pneumonia-cnn-vit-hybrid-comparison',
      text: 'ResNet-50, ViT-Base und TinyViT unter identischen Bedingungen verglichen (5-fach-CV-Ensembles): TinyViT erreicht 94,9 % Testgenauigkeit (F1 0,948); Grad-CAM-Erklärungen bewertet.',
      tech: 'PyTorch · timm · Grad-CAM',
    },
    {
      when: '2026',
      name: 'Fehlererkennung in Röntgenbildern von Gussteilen',
      repo: 'xray-casting-defect-detection-yolov8',
      text: 'YOLOv8n auf GDXray-Gussteilen trainiert (Split auf Serienebene): Test-mAP50 0,545, Precision 0,748; Fehleranalyse nach Defektgröße; ONNX-Export mit 60 ms pro Bild (CPU).',
      tech: 'YOLOv8 · OpenCV · ONNX',
    },
    {
      when: '2025/26',
      name: 'QuantumCircuit Dataset Builder',
      repo: 'QuantumCircuit-Dataset-Builder-Automated-Image-to-Text-Pipeline',
      text: 'Automatisierte arXiv-Pipeline mit SciBERT-Klassifikator für Bildunterschriften (F1 0,954): 250 Metadatensätze und 160 extrahierte Schaltkreisbilder für Image-to-Text-Training.',
      tech: 'Transformers · BeautifulSoup · PyMuPDF',
    },
    {
      when: '2026',
      name: 'Formularverständnis mit LayoutLMv3',
      repo: 'layoutlmv3-funsd-form-understanding',
      text: 'LayoutLMv3 für die Schlüssel-Wert-Extraktion aus gescannten Formularen (FUNSD) feinabgestimmt: F1 0,896 auf Entitätsebene; OCR-Pfad für nicht annotierte Dokumente.',
      tech: 'LayoutLMv3 · Hugging Face · Tesseract',
    },
    {
      when: '2025/26',
      name: 'Stacking-Ensemble & regelbasiertes Edge-Modell',
      repo: 'Machine-Learning-Challenge',
      text: 'Optuna-optimiertes Ensemble aus XGBoost, LightGBM und CatBoost (R² 0,848 bei 273 Merkmalen); drei If-else-Regeln (R² 0,915) abgeleitet, die ohne ML-Bibliotheken auf Edge-Geräten laufen.',
      tech: 'scikit-learn · Optuna',
    },
    {
      when: '2025/26',
      name: 'Autonome Robotik & digitaler Zwilling',
      repo: 'webots-rosbot-maze-navigation',
      text: 'ROSbot erkundet unbekannte Labyrinthe mit LiDAR-/Tiefenkamera-SLAM, Frontier Exploration, A* und PID (4 von 5 gelöst); digitaler Zwilling einer Klinikstation mit TurtleBot3, MQTT und Flask.',
      tech: 'Webots · SLAM · MQTT',
    },
    {
      when: '2023',
      name: 'CNN-Surrogatmodell für den Luftwiderstand (Bachelorarbeit)',
      repo: 'cnn-drag-prediction-2d-shapes',
      text: 'CNN sagt den Widerstandsbeiwert von 2D-Geometrien aus Bildern vorher, trainiert mit 12.000 simulierten Formen: 0,06–2,77 % relativer Fehler bei realen Formen einschließlich NACA-Profilen.',
      tech: 'TensorFlow/Keras · CFD',
    },
  ],
  skills: [
    ['Programmierung', 'Python (fortgeschritten), C++, SQL, Git/GitHub, REST-APIs, pytest, Linux/Bash'],
    ['ML & Deep Learning', 'PyTorch, TensorFlow/Keras, scikit-learn, XGBoost, LightGBM, CatBoost, Optuna'],
    ['Computer Vision', 'OpenCV, YOLOv8, U-Net, DeepLabV3+, Vision Transformers, Grad-CAM, ONNX'],
    ['NLP & generative KI', 'Hugging Face Transformers, LLM-Fine-Tuning (LoRA/PEFT), RAG, LangChain, SciBERT, LayoutLMv3'],
    ['Robotik & Engineering', 'Webots, SLAM, Pfadplanung (A*), PID-Regelung, MQTT, digitale Zwillinge, CAD/CAM, CFD'],
    ['Daten & Tools', 'pandas, NumPy, MongoDB, Power BI, Flask, Jupyter, Weights & Biases, LaTeX'],
  ],
  languages: [
    ['Englisch', 'C1 · verhandlungssicher'],
    ['Deutsch', 'B1 · wird aktiv ausgebaut'],
    ['Singhalesisch', 'Muttersprache'],
  ],
  certs: [
    ['09/2025', 'Bayerisch-Tschechische KI-Sommerschule: „Controlling Robots with LLMs“ (32 Std.) · Speinshart'],
    ['', 'Deep Learning Specialization · DeepLearning.AI (Coursera)'],
    ['', 'Natural Language Processing Specialization (4 Kurse) · DeepLearning.AI'],
    ['', 'AI for Medicine Specialization (3 Kurse) · DeepLearning.AI'],
  ],
  more: [
    ['Vortrag', 'Adaptive-RAG (NAACL 2024): 25-minütiger wissenschaftlicher Vortrag, Modul AI Conference, OTH Amberg-Weiden, Sommersemester 2026.'],
    ['Unternehmertum', 'VYROBA TECHS: CoreXY-3D-Drucker selbst konstruiert und gebaut und während der Pandemie ein kleines Geschäft für Sonderteile betrieben.'],
    ['Fußball', 'Spieler beim FC Amberg; ehemaliger Kapitän der Fakultäts- und Universitätsmannschaft; University Colours Award 2022.'],
  ],
};

/* ------------------------------------------------------------------ */
/*  Template                                                           */
/* ------------------------------------------------------------------ */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const entry = (e) => `
  <div class="row entry">
    <div class="when">${esc(e.when)}</div>
    <div class="what">
      <div class="role">${esc(e.role)}</div>
      <div class="org">${esc(e.org)}</div>
      ${e.points.length ? `<ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
    </div>
  </div>`;

const project = (p) => `
  <div class="row entry">
    <div class="when">${esc(p.when)}</div>
    <div class="what">
      <div class="role">${esc(p.name)} <a class="repo" href="${GH}/${p.repo}">GitHub ↗</a></div>
      <p>${esc(p.text)} <span class="tech">[${esc(p.tech)}]</span></p>
    </div>
  </div>`;

const pair = ([k, v]) => `
  <div class="row pair">
    <div class="when">${esc(k)}</div>
    <div class="what">${esc(v)}</div>
  </div>`;

const section = (title, body, cls = '') => `
  <section class="${cls}">
    <h2>${esc(title)}</h2>
    ${body}
  </section>`;

const html = (c) => `<!doctype html>
<html lang="${c.lang}">
<head>
<meta charset="utf-8">
<title>${esc(contact.name)} · ${esc(c.docTitle)}</title>
<style>
  @page { size: A4; margin: 11mm 14mm 10mm 14mm; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    margin: 0;
    font-family: 'Segoe UI', Calibri, Arial, sans-serif;
    font-size: 9pt;
    line-height: 1.36;
    color: #1f2933;
  }
  a { color: inherit; text-decoration: none; }
  p { margin: 0; }
  :root { --accent: #0b5563; --muted: #5b6770; --rule: #cfd8dc; --col: 27mm; }

  header { display: flex; justify-content: space-between; gap: 8mm; align-items: flex-start; padding-bottom: 3.8mm; border-bottom: 1.6pt solid var(--accent); }
  .doc { font-size: 8.4pt; letter-spacing: 0.03em; text-transform: uppercase; color: var(--accent); font-weight: 600; }
  h1 { margin: 1mm 0 1mm; font-size: 25pt; line-height: 1.05; font-weight: 700; letter-spacing: -0.01em; color: #111827; }
  .title { font-size: 10.4pt; color: var(--accent); font-weight: 600; }
  .facts { margin-top: 3.2mm; display: grid; grid-template-columns: auto 1fr auto 1fr; gap: 0.8mm 3mm; font-size: 8.9pt; }
  .facts b { font-weight: 600; color: var(--muted); }
  .links { margin-top: 1.6mm; font-size: 8.9pt; display: flex; flex-wrap: wrap; gap: 0.6mm 5mm; }
  .links b { font-weight: 600; color: var(--muted); margin-right: 1.5mm; }
  .links a { color: var(--accent); }
  .photo { width: 30mm; height: 37mm; object-fit: cover; border-radius: 1.5mm; border: 0.5pt solid var(--rule); flex-shrink: 0; }

  section { margin-top: 3.7mm; }
  section.page-break { break-before: page; margin-top: 0; }
  h2 { margin: 0 0 1.8mm; font-size: 10pt; letter-spacing: 0.03em; text-transform: uppercase; color: var(--accent); font-weight: 700; border-bottom: 0.6pt solid var(--rule); padding-bottom: 1mm; break-after: avoid; }
  .row { display: grid; grid-template-columns: var(--col) 1fr; column-gap: 4mm; }
  .entry { margin-bottom: 2.1mm; break-inside: avoid; }
  .entry:last-child { margin-bottom: 0; }
  .when { color: var(--muted); font-size: 8.6pt; font-weight: 600; font-variant-numeric: tabular-nums; padding-top: 0.15mm; }
  .role { font-weight: 700; font-size: 9.6pt; color: #111827; }
  .org { color: var(--muted); font-size: 8.6pt; margin-bottom: 0.3mm; }
  ul { margin: 0.4mm 0 0; padding-left: 3.6mm; }
  li { margin-bottom: 0.15mm; }
  li::marker { color: var(--accent); }
  .repo { font-weight: 600; font-size: 8pt; color: var(--accent); margin-left: 1.5mm; white-space: nowrap; }
  .tech { font-size: 8.2pt; color: var(--muted); white-space: nowrap; }
  .pair { margin-bottom: 0.7mm; break-inside: avoid; }
  .skills .row { grid-template-columns: 36mm 1fr; }
  .pair .when { color: #111827; }
  .profile { text-align: left; }
  .two { display: grid; grid-template-columns: 1fr 1fr; column-gap: 8mm; }
  .two section .row { grid-template-columns: 22mm 1fr; }
  .two { grid-template-columns: 0.8fr 1.2fr; }
  footer { margin-top: 3.5mm; padding-top: 1.6mm; border-top: 0.6pt solid var(--rule); font-size: 7.8pt; color: var(--muted); display: flex; justify-content: space-between; }
</style>
</head>
<body>
  <header>
    <div>
      <div class="doc">${esc(c.docTitle)}</div>
      <h1>${esc(contact.name)}</h1>
      <div class="title">${esc(c.title)}</div>
      <div class="facts">
        ${c.facts.map(([k, v]) => `<b>${esc(k)}</b><span>${k.includes('ail') ? `<a href="mailto:${v}">${esc(v)}</a>` : esc(v)}</span>`).join('')}
      </div>
      <div class="links">
        <span><b>LinkedIn</b><a href="https://www.${contact.linkedin}">${contact.linkedin}</a></span>
        <span><b>GitHub</b><a href="https://${contact.github}">${contact.github}</a></span>
        <span><b>Portfolio</b><a href="https://${contact.portfolio}/">${contact.portfolio}</a></span>
      </div>
    </div>
    <img class="photo" src="${photo}" alt="">
  </header>

  ${section(c.sections.profile, `<p class="profile">${esc(c.profile)}</p>`)}
  ${section(c.sections.work, c.work.map(entry).join(''))}
  ${section(c.sections.education, c.education.map(entry).join(''))}
  ${section(c.sections.projects, c.projects.map(project).join(''), 'page-break')}
  ${section(c.sections.skills, c.skills.map(pair).join(''), 'skills')}
  <div class="two">
    ${section(c.sections.languages, c.languages.map(pair).join(''))}
    ${section(c.sections.certs, c.certs.map(([d, t]) => `<div class="pair cert">${d ? `<b>${esc(d)}</b> · ` : ''}${esc(t)}</div>`).join(''))}
  </div>
  ${section(c.sections.more, c.more.map(pair).join(''), 'skills')}
  <footer><span>${esc(contact.name)} · ${esc(c.docTitle)}</span><span>${esc(c.labels.asOf)}</span></footer>
</body>
</html>`;

/* ------------------------------------------------------------------ */
/*  Print                                                              */
/* ------------------------------------------------------------------ */
const browsers = [
  process.env.CV_BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browser = browsers.find((b) => existsSync(b));
if (!browser) throw new Error('No Chrome or Edge found. Set CV_BROWSER to a Chromium-based browser.');

for (const c of [en, de]) {
  const htmlPath = join(out, `cv-${c.lang}.html`);
  const pdfPath = join(root, 'public', c.file);
  writeFileSync(htmlPath, html(c), 'utf8');
  execFileSync(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--user-data-dir=${join(out, '.profile')}`,
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: 'ignore' },
  );
  console.log(`wrote public/${c.file}`);
}
