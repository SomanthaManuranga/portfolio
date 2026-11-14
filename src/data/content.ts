/**
 * All site content lives here. Edit this file to update the portfolio —
 * no component changes needed. Figures come from each project's README.
 */

const GH = 'https://github.com/SomanthaManuranga';
const repo = (name: string) => `${GH}/${name}`;
const doc = (name: string, path: string) => `${GH}/${name}/blob/main/${path}`;

export const profile = {
  name: 'Somantha Manuranga',
  shortName: 'Somantha',
  role: 'AI Engineer',
  tagline: 'Computer vision, LLMs and industrial AI, built on a mechanical engineering foundation.',
  summary:
    'AI engineer and M.Sc. student in Artificial Intelligence for Industrial Applications at OTH Amberg-Weiden, with a ' +
    'mechanical engineering background. I work on computer vision, LLMs and automation, and I care about careful ' +
    'evaluation and models small enough to deploy.',
  location: 'Amberg, Germany',
  availability: 'AI and Automation Werkstudent at syskomp gehmeyr GmbH',
  email: 'somanthamanuranga@gmail.com',
  phone: '+49 174 7656939',
  phoneHref: 'tel:+491747656939',
  github: GH,
  linkedin: 'https://www.linkedin.com/in/somantha-manuranga-b73432192',
  cv: 'Somantha_Manuranga_CV.pdf',
  cvDe: 'Somantha_Manuranga_Lebenslauf.pdf',
  portrait: 'images/portrait.webp',
  rotatingRoles: ['Computer Vision', 'LLMs & NLP', 'Industrial AI', 'Self-Supervised Vision (JEPA)', 'Robotics & Digital Twins'],
};

export const stats = [
  { value: 13, suffix: '', label: 'Public AI & engineering projects' },
  { value: 3, suffix: '', label: 'DeepLearning.AI specializations' },
  { value: 2, suffix: '', label: 'Engineering & AI degrees' },
  { value: 3, suffix: '', label: 'Languages spoken' },
];

export type Category = 'LLM & NLP' | 'Computer Vision' | 'Robotics' | 'Engineering AI' | 'Data & ML';

export const categories: Category[] = ['LLM & NLP', 'Computer Vision', 'Engineering AI', 'Robotics', 'Data & ML'];

export interface Metric {
  value: string;
  label: string;
}

export interface Link {
  label: string;
  href: string;
  kind: 'code' | 'doc' | 'demo' | 'paper';
}

export interface Project {
  slug: string;
  title: string;
  category: Category;
  year: string;
  context: string;
  summary: string;
  highlights: string[];
  metrics: Metric[];
  tech: string[];
  links: Link[];
  featured?: boolean;
  accent: string;
}

export const projects: Project[] = [
  {
    slug: 'llm-backdoor-defense',
    title: 'Removing Jailbreak Backdoors from LLMs with Hybrid SFT',
    category: 'LLM & NLP',
    year: '2026',
    context: 'AI Security & Privacy · OTH Amberg-Weiden',
    summary:
      'Removed a known jailbreak backdoor from Qwen2.5-1.5B on a single 8 GB GPU with a balanced four-group supervised fine-tuning dataset, then used mechanistic probes to show the trigger is hidden, not erased.',
    highlights: [
      'A naive defence reached 0 % attack success but refused 100 % of harmless prompts containing the trigger; the four-group dataset cut false refusals to 6 %.',
      'Generalises out of distribution: attack success 6.4 % on StrongREJECT categories never seen in training.',
      'Linear probes still detect the trigger with ~97 % accuracy: the defence flips the reaction from obey to refuse in the upper layers.',
    ],
    metrics: [
      { value: '95% → 1.7%', label: 'Attack success rate' },
      { value: '84%', label: 'Benign accuracy kept' },
      { value: '~97%', label: 'Trigger probe accuracy' },
    ],
    tech: ['PyTorch', 'Qwen2.5', 'LoRA / PEFT', 'Hugging Face', 'Mechanistic Interpretability'],
    links: [
      { label: 'Code', href: repo('llm-backdoor-defense-hybrid-sft'), kind: 'code' },
      { label: 'Report', href: doc('llm-backdoor-defense-hybrid-sft', 'report/AI_Security_and_Privacy_Project_Report_Somantha_Manuranga.pdf'), kind: 'doc' },
      { label: 'Slides', href: doc('llm-backdoor-defense-hybrid-sft', 'presentation/slides.pdf'), kind: 'doc' },
    ],
    featured: true,
    accent: '#f472b6',
  },
  {
    slug: 'pneumonia-cnn-vit',
    title: 'Pneumonia Detection: CNN vs ViT vs Hybrid with Grad-CAM',
    category: 'Computer Vision',
    year: '2026',
    context: 'Deep Vision · OTH Amberg-Weiden',
    summary:
      'Trained ResNet-50, ViT-Base and the CNN-Transformer hybrid TinyViT under identical conditions on chest X-rays (5-fold CV, soft-voting ensemble), then compared accuracy and whether their Grad-CAM heatmaps actually look at the lungs.',
    highlights: [
      'TinyViT is the most accurate with the fewest parameters (20.7 M) and the most stable folds (CV F1 0.979 ± 0.002).',
      "ResNet-50's heatmaps are the most trustworthy: most often inside the body and best on the deletion test.",
      'Evaluated on the held-out Kermany test set (624 images) that was never used for training or model selection.',
    ],
    metrics: [
      { value: '94.9%', label: 'Test accuracy (TinyViT)' },
      { value: '0.948', label: 'Test F1' },
      { value: '99.5%', label: 'Pneumonia recall' },
    ],
    tech: ['PyTorch', 'timm', 'TinyViT', 'ViT', 'ResNet-50', 'Grad-CAM', 'Explainable AI'],
    links: [
      { label: 'Code', href: repo('pneumonia-cnn-vit-hybrid-comparison'), kind: 'code' },
      { label: 'Report', href: doc('pneumonia-cnn-vit-hybrid-comparison', 'docs/report.pdf'), kind: 'doc' },
    ],
    featured: true,
    accent: '#5eead4',
  },
  {
    slug: 'xray-casting-defects',
    title: 'X-ray Casting Defect Detection with YOLOv8',
    category: 'Computer Vision',
    year: '2026',
    context: 'Industrial inspection · Non-destructive testing',
    summary:
      'Fine-tuned YOLOv8n to find pores, inclusions and shrinkage cavities in GDXray X-ray images of aluminium wheels, with a series-level split, failure analysis by defect size, a CLAHE ablation and ONNX export.',
    highlights: [
      'Series-level split so test castings are never seen in training; evaluated on 1,308 crops with 960 defects.',
      'Failure analysis: recall is 1.00 for defects over 32 px but 0.08 under 16 px, so small faint pores are the main failure mode.',
      'ONNX export gives identical detections to PyTorch on 20/20 test crops and runs at 60 ms vs 73 ms per image on CPU.',
    ],
    metrics: [
      { value: '0.545', label: 'Test mAP50' },
      { value: '0.748', label: 'Precision' },
      { value: '60 ms', label: 'ONNX CPU inference' },
    ],
    tech: ['YOLOv8', 'Ultralytics', 'OpenCV', 'CLAHE', 'ONNX'],
    links: [{ label: 'Code', href: repo('xray-casting-defect-detection-yolov8'), kind: 'code' }],
    featured: true,
    accent: '#fbbf24',
  },
  {
    slug: 'quantum-circuit-dataset',
    title: 'QuantumCircuit Dataset Builder: Image-to-Text Pipeline',
    category: 'LLM & NLP',
    year: '2026',
    context: 'NLP & Information Retrieval · OTH Amberg-Weiden',
    summary:
      'An automated pipeline that mines arXiv quant-ph papers for quantum-circuit figures and pairs each with structured metadata, creating a prototype dataset for fine-tuning image-to-text models on technical diagrams.',
    highlights: [
      'arXiv HTML → BeautifulSoup caption extraction → fine-tuned SciBERT classifier → regex enrichment for 50+ gates and 40+ algorithms.',
      'Compared PDF heuristics, LaTeX parsing and HTML + source archives; picked HTML for clean caption-figure links.',
      'Recovered original image files from the arXiv LaTeX source archives.',
    ],
    metrics: [
      { value: '0.954', label: 'SciBERT F1' },
      { value: '250', label: 'Metadata records' },
      { value: '160', label: 'Circuit images' },
    ],
    tech: ['Python', 'SciBERT', 'Transformers', 'BeautifulSoup', 'PyMuPDF', 'arXiv'],
    links: [
      { label: 'Code', href: repo('QuantumCircuit-Dataset-Builder-Automated-Image-to-Text-Pipeline'), kind: 'code' },
      { label: 'Report', href: doc('QuantumCircuit-Dataset-Builder-Automated-Image-to-Text-Pipeline', 'docs/report.pdf'), kind: 'doc' },
    ],
    featured: true,
    accent: '#a78bfa',
  },
  {
    slug: 'cnn-drag-prediction',
    title: 'CNN Surrogate Model for Aerodynamic Drag Prediction',
    category: 'Engineering AI',
    year: '2023',
    context: 'B.Sc. thesis · University of Sri Jayewardenepura',
    summary:
      'A CNN that predicts the drag coefficient of any 2D shape directly from a 256 × 256 image in milliseconds, instead of setting up and running a CFD simulation. Trained on 12,000 shapes in laminar flow (Re = 10).',
    highlights: [
      'Compared 7 CNN architectures; the final model reached a validation MSE of 0.0017.',
      'Tested on unseen real-world shapes against SolidWorks Flow Simulation, including NACA 4412, 4424 and 0018 airfoils.',
      'Published with thesis, paper, poster and a 3-minute video.',
    ],
    metrics: [
      { value: '0.06–2.77%', label: 'Relative error, real shapes' },
      { value: '12,000', label: 'Training shapes' },
      { value: '7', label: 'CNN architectures compared' },
    ],
    tech: ['TensorFlow', 'Keras', 'CNN', 'CFD', 'Surrogate Modelling'],
    links: [
      { label: 'Code', href: repo('cnn-drag-prediction-2d-shapes'), kind: 'code' },
      { label: 'Thesis', href: doc('cnn-drag-prediction-2d-shapes', 'docs/thesis.pdf'), kind: 'paper' },
      { label: 'Paper', href: doc('cnn-drag-prediction-2d-shapes', 'docs/paper.pdf'), kind: 'paper' },
      { label: 'Video', href: doc('cnn-drag-prediction-2d-shapes', 'docs/demo_video.mp4'), kind: 'demo' },
    ],
    featured: true,
    accent: '#38bdf8',
  },
  {
    slug: 'layoutlmv3-funsd',
    title: 'LayoutLMv3 Form Understanding on FUNSD',
    category: 'LLM & NLP',
    year: '2026',
    context: 'Document AI',
    summary:
      'Fine-tuned LayoutLMv3 to read scanned forms: every word is labelled as question, answer, header or other, then questions are linked to answers for key-value output. Includes a Tesseract OCR path for unannotated documents.',
    highlights: [
      'Text + layout + image model with a 7-label BIO token-classification head (125 M parameters).',
      'Matches the ~0.90 F1 reported for LayoutLMv3-base in the paper; fine-tuning took under 5 minutes on one GPU.',
      'Nearest-answer heuristic turns entity predictions into key-value pairs.',
    ],
    metrics: [
      { value: '0.896', label: 'Entity-level F1' },
      { value: '0.904', label: 'Recall' },
      { value: '<5 min', label: 'Fine-tuning time' },
    ],
    tech: ['LayoutLMv3', 'Hugging Face', 'PyTorch', 'Tesseract OCR', 'seqeval'],
    links: [{ label: 'Code', href: repo('layoutlmv3-funsd-form-understanding'), kind: 'code' }],
    accent: '#c084fc',
  },
  {
    slug: 'corrosion-segmentation',
    title: 'Corrosion Segmentation: U-Net vs DeepLabV3+',
    category: 'Computer Vision',
    year: '2026',
    context: 'Infrastructure inspection',
    summary:
      'Pixel-level segmentation of corrosion condition states on steel bridge inspection photos. Both models share the same ResNet-34 encoder, data, loss and schedule, so the comparison isolates the decoder design.',
    highlights: [
      'U-Net segments the rare Severe class noticeably better (IoU 0.325 vs 0.266), which matters most for maintenance.',
      'Dice + cross-entropy loss keeps rare classes (Severe is 0.9 % of pixels) from being ignored.',
      'Domain-aware augmentation: no vertical flips, since rust streaks run downwards.',
    ],
    metrics: [
      { value: '0.523', label: 'Mean IoU (U-Net)' },
      { value: '0.325', label: 'Severe-class IoU' },
      { value: '4', label: 'AASHTO condition states' },
    ],
    tech: ['PyTorch', 'segmentation-models-pytorch', 'U-Net', 'DeepLabV3+', 'Albumentations'],
    links: [{ label: 'Code', href: repo('corrosion-segmentation-unet-deeplabv3plus'), kind: 'code' }],
    accent: '#fb923c',
  },
  {
    slug: 'rosbot-maze',
    title: 'Autonomous ROSbot Maze Navigation',
    category: 'Robotics',
    year: '2026',
    context: 'Autonomous Robotics · OTH Amberg-Weiden',
    summary:
      'A four-wheel ROSbot explores unknown mazes with no map, finds the blue then the yellow pillar, and avoids green floor hazards and raised planks that its LiDAR cannot see.',
    highlights: [
      'LiDAR + depth-camera occupancy mapping, frontier exploration, A* planning and PID control.',
      'Completed 4 of 5 mazes end to end; the fastest full run took 54 seconds.',
      'Camera-based hazard detection covers obstacles invisible to the LiDAR scan plane.',
    ],
    metrics: [
      { value: '0:54', label: 'Fastest full run' },
      { value: '4 / 5', label: 'Mazes completed' },
      { value: '0', label: 'Prior map' },
    ],
    tech: ['Python', 'Webots', 'SLAM', 'A*', 'PID', 'OpenCV', 'LiDAR'],
    links: [
      { label: 'Code', href: repo('webots-rosbot-maze-navigation'), kind: 'code' },
      { label: 'Run videos', href: 'https://drive.google.com/drive/folders/1NvmL1ATCnpO4yF6ab3tLbMCFY3grwadr?usp=sharing', kind: 'demo' },
      { label: 'Report', href: doc('webots-rosbot-maze-navigation', 'docs/report.pdf'), kind: 'doc' },
    ],
    accent: '#34d399',
  },
  {
    slug: 'alia-digital-twin',
    title: 'ALIA-Delivery: Hospital Robot Digital Twin',
    category: 'Robotics',
    year: '2025',
    context: 'Industry 4.0 (Care 4.0) team project',
    summary:
      'A Webots digital twin of one hospital floor. A TurtleBot3 receives delivery orders from a Flask control centre over MQTT, plans an A* route through the grid map and drives itself to the patient’s room.',
    highlights: [
      'MQTT layer (Mosquitto) links the web control centre to the Webots supervisor controller.',
      'A* on a 61 × 76 grid with 0.25 m cells; turn-then-drive waypoint following within ±2° and 5 cm.',
      'Separate LiDAR explorer builds the occupancy-grid map of the floor.',
    ],
    metrics: [
      { value: 'MQTT', label: 'Real-time command layer' },
      { value: '61×76', label: 'Planning grid' },
      { value: '5 cm', label: 'Position tolerance' },
    ],
    tech: ['Python', 'Webots', 'TurtleBot3', 'MQTT', 'Flask', 'A*', 'Digital Twin'],
    links: [{ label: 'Code', href: repo('Alia-Delivery-Project'), kind: 'code' }],
    accent: '#2dd4bf',
  },
  {
    slug: 'ml-challenge',
    title: 'Stacking Ensemble Regression & Edge-Ready Rule Discovery',
    category: 'Data & ML',
    year: '2026',
    context: 'Machine Learning · OTH Amberg-Weiden',
    summary:
      'A two-part challenge on 273-feature tabular data: a gradient-boosting stacking ensemble for a target with almost no linear signal, and three reverse-engineered if-else rules that run on an edge device without ML libraries.',
    highlights: [
      'Optuna-tuned XGBoost, LightGBM and CatBoost stacked to R² = 0.848, against a linear baseline of 0.047.',
      'Part 2: three rules on three features reach R² = 0.915 using only comparisons and arithmetic.',
    ],
    metrics: [
      { value: '0.848', label: 'R², stacking ensemble' },
      { value: '0.915', label: 'R², 3-rule edge model' },
      { value: '273', label: 'Input features' },
    ],
    tech: ['XGBoost', 'LightGBM', 'CatBoost', 'Optuna', 'scikit-learn'],
    links: [
      { label: 'Code', href: repo('Machine-Learning-Challenge'), kind: 'code' },
      { label: 'Report', href: doc('Machine-Learning-Challenge', 'docs/report.pdf'), kind: 'doc' },
    ],
    accent: '#60a5fa',
  },
  {
    slug: 'study-program-intelligence',
    title: 'Study Program Intelligence',
    category: 'Data & ML',
    year: '2026',
    context: 'Data analytics for OTH Amberg-Weiden',
    summary:
      'A reproducible analysis of which new degree programme would attract the most students to the EMI faculty, combining federal statistics, labour-market data, competitor handbooks and search trends in a multi-criteria decision analysis under uncertainty.',
    highlights: [
      'Monte Carlo ranking over 10,000 draws plus leave-one-criterion-out robustness checks.',
      'Models demand, competition, labour market, faculty fit and required resources.',
      'Results are preliminary until the December 2026 data freeze.',
    ],
    metrics: [
      { value: '10,000', label: 'Monte Carlo draws' },
      { value: 'MCDA', label: 'Decision method' },
      { value: 'Open', label: 'Reproducible pipeline' },
    ],
    tech: ['Python', 'pandas', 'Monte Carlo', 'MCDA', 'Public statistics'],
    links: [{ label: 'Code', href: repo('study-program-intelligence'), kind: 'code' }],
    accent: '#818cf8',
  },
  {
    slug: 'social-media-eda',
    title: "Students' Social Media Addiction: EDA",
    category: 'Data & ML',
    year: '2025',
    context: 'Programming Starter · OTH Amberg-Weiden',
    summary:
      'Exploratory analysis of 705 students from 110 countries: how daily social-media use relates to sleep, mental health, academic performance and relationships.',
    highlights: [
      'Daily usage correlates with sleep hours at r = −0.79.',
      'Students who say social media hurts their studies sleep 6.34 h vs 7.81 h and report ~25 % lower mental-health scores.',
    ],
    metrics: [
      { value: 'r = −0.79', label: 'Usage vs sleep' },
      { value: '705', label: 'Students' },
      { value: '110', label: 'Countries' },
    ],
    tech: ['pandas', 'Seaborn', 'Matplotlib', 'Jupyter'],
    links: [{ label: 'Code', href: repo('student-social-media-addiction-eda'), kind: 'code' }],
    accent: '#f9a8d4',
  },
  {
    slug: 'ir-thermometer',
    title: 'Digital IR Thermometer Simulation',
    category: 'Engineering AI',
    year: '2025',
    context: 'Medical Systems Engineering · OTH Amberg-Weiden',
    summary:
      'A physics-based simulation of a non-contact IR body thermometer that models sensor noise, drift, emissivity bias and spikes, then recovers a reliable reading with moving-average filtering and outlier rejection.',
    highlights: [
      'Stefan–Boltzmann sensor model with emissivity calibration error as a systematic bias.',
      '121 readings over 60 s, cleaned with signal processing.',
    ],
    metrics: [
      { value: '121', label: 'Simulated readings' },
      { value: '4', label: 'Error sources modelled' },
      { value: 'εT⁴', label: 'Physics model' },
    ],
    tech: ['Python', 'NumPy', 'Signal Processing', 'Simulation'],
    links: [{ label: 'Code', href: repo('Digital-IR-thermometer-Simulation-using-Python'), kind: 'code' }],
    accent: '#f87171',
  },
  {
    slug: 'production-analytics-dashboard',
    title: 'Industrial Production Analytics Dashboard',
    category: 'Data & ML',
    year: '2025',
    context: 'Manufacturing analytics',
    summary:
      'Interactive Power BI dashboards that track manufacturing KPIs, built on star-schema data models with automated ETL pipelines so cross-functional teams work from the same numbers.',
    highlights: [
      'Star-schema data model with DAX measures for production KPIs.',
      'Automated ETL with Power Query and SQL instead of manual spreadsheet updates.',
    ],
    metrics: [
      { value: 'Power BI', label: 'Dashboards' },
      { value: 'Star schema', label: 'Data model' },
      { value: 'ETL', label: 'Automated pipelines' },
    ],
    tech: ['Power BI', 'DAX', 'Power Query', 'SQL', 'Star Schema'],
    links: [],
    accent: '#facc15',
  },
  {
    slug: 'corexy-printer',
    title: 'CoreXY 3D Printer: Mechatronic Build',
    category: 'Engineering AI',
    year: '2019–2023',
    context: 'B.Sc. project & VYROBA TECHS venture',
    summary:
      'Designed and built a CoreXY 3D printer from scratch during my mechanical engineering degree, integrating mechanical design with data-driven process tuning, then used it to run a small manufacturing business.',
    highlights: [
      'Mechanical design, kinematics and firmware for high-speed printing.',
      'Delivered functional parts and engineering prototypes during pandemic supply-chain disruptions.',
    ],
    metrics: [
      { value: 'CoreXY', label: 'Kinematics' },
      { value: 'CAD→part', label: 'Full ownership' },
      { value: 'Venture', label: 'Real customers' },
    ],
    tech: ['Mechatronics', 'CAD/CAM', 'Firmware', 'Additive Manufacturing'],
    links: [],
    accent: '#fb7185',
  },
];

export const talks = [
  {
    title: 'Adaptive-RAG: Learning to Adapt Retrieval-Augmented LLMs through Question Complexity',
    venue: 'AI Conference module · OTH Amberg-Weiden · Summer 2026',
    summary:
      'A 25-minute scientific talk on the NAACL 2024 paper by Jeong et al. (KAIST): how a query-complexity classifier routes each question to no retrieval, single-step or multi-step RAG, trading accuracy against latency. 52-slide LaTeX Beamer deck covering the formal problem, experiments, classifier analysis and case studies.',
    tags: ['RAG', 'LLMs', 'Question Answering', 'LaTeX Beamer'],
    links: [
      { label: 'Slides', href: 'talks/adaptive-rag-slides.pdf' },
      { label: 'Original paper', href: 'https://arxiv.org/abs/2403.14403' },
    ],
  },
];

export interface Job {
  role: string;
  company: string;
  period: string;
  location: string;
  logo?: string;
  current?: boolean;
  points: string[];
  tags: string[];
}

export const experience: Job[] = [
  {
    role: 'AI and Automation Werkstudent',
    company: 'syskomp gehmeyr GmbH',
    period: 'Oct 2026 – present',
    location: 'Amberg, Germany',
    logo: 'images/logo-syskomp.svg',
    current: true,
    points: [
      'Applying AI methods to engineering and industrial workflows in a mechanical engineering environment.',
      'Building and evaluating Python prototypes with an emphasis on traceable, validated results.',
      'Working with engineering colleagues to turn requirements into practical AI tooling. Project details are confidential.',
    ],
    tags: ['Python', 'Applied AI', 'Mechanical Engineering', 'Industry 4.0'],
  },
  {
    role: 'Design Engineer',
    company: 'KNSI Aviation Engineering',
    period: 'Aug 2023 – Sep 2024',
    location: 'Negombo, Sri Lanka',
    logo: 'images/logo-knsi.webp',
    points: [
      'Managed compliance data workflows and technical documentation with SQL and Excel for aviation standards.',
      'Built automated SQL/Excel reporting templates that cut weekly reporting time by 30 %.',
      'Analysed production data to optimise workflows, raising process efficiency by 40 %.',
      'Led digitalisation of legacy documentation for faster cross-department data access.',
    ],
    tags: ['SQL', 'Excel', 'Data Management', 'Automation'],
  },
  {
    role: 'Internship Trainee, Mechatronics & Data',
    company: 'CBL Group (Ceylon Biscuits Limited)',
    period: 'Feb 2022 – Nov 2022',
    location: 'Pannipitiya, Sri Lanka',
    logo: 'images/logo-cbl.webp',
    points: [
      'Contributed to process optimisation through data-driven solutions and automation projects.',
      'Worked on end-of-line automation with articulated and parallel robots.',
      'Designed and rapidly prototyped 3D-printed automation components, reducing external sourcing costs and lead times.',
      'Deployed IoT sensors for real-time asset monitoring as groundwork for predictive maintenance.',
    ],
    tags: ['Robotics', 'Automation', '3D Printing', 'IoT'],
  },
];

export const education = [
  {
    degree: 'M.Sc. Artificial Intelligence for Industrial Applications',
    school: 'OTH Amberg-Weiden',
    period: 'Mar 2025 – 2027 (expected)',
    location: 'Amberg, Germany',
    logo: 'images/logo-oth.webp',
    details: [
      'Modules: Computer Vision, Deep Vision, Deep Learning, NLP & Information Retrieval, Autonomous Robotics, AI Security & Privacy, Machine Learning.',
      'Bridge semester (Summer 2025): Industry 4.0, Medical Systems Engineering, Programming.',
    ],
  },
  {
    degree: 'B.Sc. (Hons) Mechanical Engineering, Minor in Mechatronics',
    school: 'University of Sri Jayewardenepura',
    period: 'Nov 2019 – May 2023',
    location: 'Sri Lanka',
    logo: 'images/logo-usj.webp',
    details: [
      'GPA 3.27 / 4.',
      'Thesis: CNN surrogate model for 2D aerodynamic drag prediction (NACA airfoils).',
      'Project: CoreXY 3D printer integrating mechanical design and machine learning.',
    ],
  },
];

export const skillGroups = [
  {
    title: 'AI / ML & Generative AI',
    items: ['PyTorch', 'TensorFlow', 'scikit-learn', 'Hugging Face', 'LLMs', 'LoRA / PEFT', 'RAG', 'LangChain', 'Agentic workflows', 'XGBoost', 'Optuna'],
  },
  {
    title: 'Computer Vision',
    items: ['OpenCV', 'YOLOv8', 'U-Net', 'DeepLabV3+', 'Vision Transformers', 'Grad-CAM', 'ONNX', 'Albumentations'],
  },
  {
    title: 'NLP & Document AI',
    items: ['Transformers', 'SciBERT', 'LayoutLMv3', 'Tesseract OCR', 'BeautifulSoup', 'PyMuPDF'],
  },
  {
    title: 'Robotics & Engineering',
    items: ['Webots', 'SLAM', 'A* / path planning', 'PID control', 'MQTT', 'Digital twins', 'CAD/CAM', 'CFD'],
  },
  {
    title: 'Data & Backend',
    items: ['Python', 'C++', 'SQL', 'pandas', 'NumPy', 'MongoDB', 'Power BI', 'REST APIs'],
  },
  {
    title: 'Tools',
    items: ['Git / GitHub', 'Jupyter', 'Weights & Biases', 'pytest', 'LaTeX'],
  },
];

export const certifications = [
  {
    title: 'Deep Learning Specialization',
    issuer: 'DeepLearning.AI · Coursera',
    note: 'Neural networks from scratch in NumPy, bias/variance and error analysis, CNNs and sequence models.',
    href: 'https://coursera.org/share/8b6a07b9dd4edcf5d535c7f9aad6cb1c',
  },
  {
    title: 'Natural Language Processing Specialization',
    issuer: 'DeepLearning.AI · 4 courses',
    note: 'Attention, Transformers, LSTMs and encoder-decoder models for sequence tasks.',
    href: 'https://coursera.org/share/ca67211092957e9555e3226976dde369',
  },
  {
    title: 'AI for Medicine Specialization',
    issuer: 'DeepLearning.AI · 3 courses',
    note: '3D CNNs on MRI and X-ray, survival analysis and tree-based prognosis models.',
    href: 'https://coursera.org/share/3457b8240c3e21c3a4feb7430a6d45d3',
  },
  {
    title: 'Niryo in Action: Controlling Robots with LLMs',
    issuer: 'Bavarian–Czech AI Summer School · Speinshart · Sept 2025 · 32 h',
    note: 'Natural-language robot control with OpenAI and Ollama, vision-guided pick and place with OpenCV, conveyor and sensor integration.',
    href: 'https://drive.google.com/file/d/1nMiAHZk116D1vMsS9A6Eh08QCozaBvMi/view?usp=sharing',
  },
];

export const endorsements = [
  {
    quote:
      'Demonstrated exceptional ability to replace traditional computational methods with data-driven ML solutions. High technical competence and strong independent research capacity in applying machine learning to aerodynamic simulations.',
    name: 'Dr. Charita Makavita',
    title: 'Senior Lecturer, Faculty of Engineering',
    org: 'University of Sri Jayewardenepura',
  },
  {
    quote:
      'Exceptional dedication in robotics and automation projects. Highly responsible with end-of-line automation using articulated and parallel robots. Demonstrated strong enthusiasm for engineering development and problem-solving.',
    name: 'Eng. Piumal Jayasooriya',
    title: 'Group Projects Manager',
    org: 'CBL Corporate Services (Pvt) Ltd',
  },
];

/** How the About line ends; the phrases take turns. Each one stands for a way of working shown in the projects. */
export const aboutPhrases = ['physics-aware.', 'honestly evaluated.', 'small enough to deploy.', 'wired to real machines.'];

export const venture = {
  name: 'VYROBA TECHS',
  text: 'During the pandemic I saw a local shortage of precision manufacturing capacity, so I designed and built a CoreXY 3D printer from scratch and started a small manufacturing business around it.',
  points: [
    'Product engineering: mechanical assemblies and firmware for high-speed printing.',
    'Delivered custom prototypes and functional parts during supply-chain disruptions.',
    'Owned everything from CAD design to customer relations.',
  ],
  images: [1, 2, 3, 5, 6, 7, 8, 9, 4].map((i) => `images/venture-${i}.webp`),
};

export const beyond = [
  {
    title: 'Sports & leadership',
    text: 'Player at FC Amberg in Germany. Former captain of the engineering faculty and university football teams in Sri Lanka, and University Colours Award for sports excellence (2022).',
    image: 'images/sports-award.webp',
  },
  {
    title: 'Languages',
    text: 'English (C1, professional), German (B1, improving) and Sinhala (native).',
    image: 'images/telc.webp',
  },
];

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'beyond', label: 'Beyond' },
  { id: 'contact', label: 'Contact' },
];
