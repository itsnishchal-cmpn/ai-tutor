# PadhAI — Architecture & Flow Diagram

## High-Level System Architecture

```mermaid
flowchart TB
    subgraph Browser["🌐 Browser (React 19 + Vite)"]
        direction TB

        subgraph Entry["App Entry"]
            main["main.tsx<br/>ReactDOM.createRoot()"]
            App["App.tsx<br/>BrowserRouter + UserProvider"]
            Routes["AppRoutes<br/>/ → LandingPage<br/>/learn → ProtectedRoute"]
        end

        subgraph Contexts["State Management (React Context)"]
            UC["UserContext<br/>📦 name: string"]
            CC["ChatContext<br/>📦 messages: Message[]<br/>📦 isStreaming: boolean<br/>📦 streamingContent: string<br/>📦 currentTopicId: string"]
            PC["ProgressContext<br/>📦 progress: Record‹topicId, TopicProgress›<br/>📦 completedTopics / totalQuizzes / correctQuizzes"]
        end

        subgraph Storage["localStorage (padhai_ prefix)"]
            LS1["padhai_user_name"]
            LS2["padhai_progress"]
            LS3["padhai_chat_{topicId}<br/>(per-topic message history)"]
        end

        subgraph Data["Curriculum & Prompt Data"]
            Curr["curriculum.ts<br/>Chapter → Section → Topic<br/>11 topics in 3 sections"]
            SP["systemPrompt.ts<br/>buildSystemPrompt(name, topicId)<br/>→ Hinglish persona + NCERT content<br/>+ rich content markers spec"]
            VM["videoMap.ts<br/>videoId → YouTube embed ID"]
        end

        subgraph Hooks["Custom Hooks"]
            UCH["useChat()<br/>selectTopic() / sendUserMessage()<br/>orchestrates entire chat flow"]
        end

        subgraph UI["Component Tree"]
            AL["AppLayout<br/>(3-column layout)"]
            CS["CurriculumSidebar<br/>Topic tree + completion badges"]
            CI["ChatInterface<br/>Messages + Input/Completion banner"]
            PP["ProgressPanel<br/>Stats dashboard + Reset"]
            MB["MessageBubble → MessageContent"]
            RC["Rich Components<br/>DiagramRenderer / QuizQuestion<br/>LessonSummary / VideoEmbed<br/>MathExpression / ResourceCard"]
        end

        subgraph Parsing["Response Parsing"]
            PAR["parseAIResponse(text)<br/>→ RichContentBlock[]<br/>text / math / diagram / video<br/>quiz / summary / resources"]
        end
    end

    subgraph Server["☁️ Netlify Serverless"]
        NF["/.netlify/functions/chat<br/>POST { messages, systemPrompt }"]
    end

    subgraph AI["🤖 Anthropic API"]
        Claude["Claude Sonnet 4<br/>claude-sonnet-4-20250514<br/>max_tokens: 1024<br/>Streaming (SSE)"]
    end

    main --> App --> Routes
    Routes --> UC
    UC --> CC --> PC --> AL
    AL --> CS & CI & PP
    CI --> MB --> RC

    UCH -->|"dispatch actions"| CC
    UCH -->|"markTopicStarted/Completed"| PC
    UCH -->|"save/load chat"| LS3

    UC <-->|"persist name"| LS1
    PC <-->|"persist progress"| LS2

    UCH -->|"buildSystemPrompt()"| SP
    SP -->|"getTopicById()"| Curr

    UCH -->|"sendMessage() via api.ts"| NF
    NF -->|"anthropic.messages.stream()"| Claude
    Claude -->|"SSE chunks"| NF
    NF -->|"data: {type, text}"| UCH

    UCH -->|"onDone → parse"| PAR
    PAR -->|"RichContentBlock[]"| MB
```

## State Management Detail

```mermaid
flowchart LR
    subgraph UserContext
        UN["name: string"]
    end

    subgraph ChatContext["ChatContext (useReducer)"]
        direction TB
        CS2["ChatState"]
        CR["chatReducer"]

        A1["ADD_USER_MESSAGE<br/>→ append user msg"]
        A2["START_STREAMING<br/>→ isStreaming=true"]
        A3["APPEND_STREAM<br/>→ concat chunk"]
        A4["FINISH_STREAMING<br/>→ create assistant msg with blocks"]
        A5["SET_TOPIC<br/>→ reset msgs, set topicId"]
        A6["LOAD_MESSAGES<br/>→ restore saved msgs"]
        A7["CLEAR_CHAT<br/>→ reset all"]
    end

    subgraph ProgressContext
        direction TB
        PS["progress: Record‹string, TopicProgress›"]
        TP["TopicProgress:<br/>• topicId<br/>• started: boolean<br/>• completed: boolean<br/>• quizResults: QuizAnswer[]<br/>• lastAccessed: number"]

        MTS["markTopicStarted()"]
        MTC["markTopicCompleted()"]
        AQR["addQuizResult()<br/>(dedupes by quizId)"]
        RP["resetProgress()"]
    end

    subgraph LocalStorage["localStorage"]
        L1["padhai_user_name"]
        L2["padhai_progress"]
        L3["padhai_chat_{topicId}"]
    end

    UN <--> L1
    PS <--> L2
    A4 & A6 -.->|"save after response"| L3
    A5 -.->|"load on topic switch"| L3
```

## Curriculum Data Structure

```mermaid
flowchart TB
    subgraph Chapter["Chapter: ch8-3<br/>Understanding Quadrilaterals<br/>Class 8, Mathematics"]
        direction TB

        subgraph S1["Section: ch8-3-intro<br/>Introduction"]
            T1["polygons-basics<br/>Polygons & Classification"]
            T2["angle-sum-property<br/>Angle Sum Property"]
        end

        subgraph S2["Section: ch8-3-types<br/>Types of Quadrilaterals"]
            T3["quadrilateral-basics<br/>Quadrilateral Basics"]
            T4["parallelogram"]
            T5["rhombus"]
            T6["rectangle"]
            T7["square"]
            T8["kite"]
            T9["trapezium"]
        end

        subgraph S3["Section: ch8-3-special<br/>Special Properties"]
            T10["diagonal-properties"]
            T11["quadrilateral-family"]
        end
    end

    subgraph Helpers["Helper Functions"]
        H1["getTopicById(id)<br/>→ { chapter, section, topic }"]
        H2["getAllTopicIds()<br/>→ string[] (ordered)"]
        H3["getNextTopicId(id)<br/>→ next topic ID or null"]
    end

    T1 -->|"next"| T2 -->|"next"| T3 -->|"next"| T4 -->|"next"| T5
    T5 -->|"next"| T6 -->|"next"| T7 -->|"next"| T8 -->|"next"| T9
    T9 -->|"next"| T10 -->|"next"| T11

    Chapter --> Helpers
```

## AI Chat Flow (Complete Message Lifecycle)

```mermaid
sequenceDiagram
    participant U as User
    participant CI as ChatInterface
    participant UC as useChat()
    participant CC as ChatContext
    participant API as api.ts
    participant NF as Netlify Function
    participant CL as Claude Sonnet 4
    participant PAR as parseAIResponse
    participant PC as ProgressContext
    participant LS as localStorage

    Note over U,LS: === Topic Selection ===
    U->>CI: Clicks topic in sidebar
    CI->>UC: selectTopic(topicId)
    UC->>LS: Save current chat (padhai_chat_{oldTopic})
    UC->>LS: Check for saved chat (padhai_chat_{newTopic})

    alt Saved chat exists
        UC->>PAR: Re-parse blocks for assistant msgs
        UC->>CC: dispatch LOAD_MESSAGES
    else New topic
        UC->>CC: dispatch SET_TOPIC
        UC->>PC: markTopicStarted(topicId)
    end

    Note over UC,CL: === Initial AI Greeting ===
    UC->>UC: buildSystemPrompt(name, topicId)
    UC->>CC: dispatch START_STREAMING
    UC->>API: sendMessage({ systemPrompt, messages: [synthetic intro] })
    API->>NF: POST /.netlify/functions/chat
    NF->>CL: anthropic.messages.stream()

    loop SSE Streaming
        CL-->>NF: text delta
        NF-->>API: data: {"type":"content","text":"..."}
        API-->>UC: onChunk(text)
        UC->>CC: dispatch APPEND_STREAM
        CC-->>CI: streamingContent → StreamingText component
    end

    NF-->>API: data: [DONE]
    API-->>UC: onDone(fullText)
    UC->>PAR: parseAIResponse(fullText)
    PAR-->>UC: RichContentBlock[]
    UC->>CC: dispatch FINISH_STREAMING { blocks }
    CC-->>CI: New message with blocks rendered

    Note over U,LS: === User Sends Message ===
    U->>CI: Types message + Enter
    CI->>UC: sendUserMessage(content)
    UC->>CC: dispatch ADD_USER_MESSAGE
    UC->>API: sendMessage({ systemPrompt, messages: [...history, newMsg] })

    Note over API,CL: Same streaming flow as above

    UC->>CC: dispatch FINISH_STREAMING
    UC->>LS: Save full history (padhai_chat_{topicId})

    Note over U,LS: === Quiz Answer ===
    U->>CI: Selects answer in QuizQuestion
    CI->>PC: addQuizResult({ quizId, isCorrect, ... })
    PC->>LS: persist to padhai_progress
    CI->>UC: sendUserMessage("I answered X...")
    Note over UC,CL: Triggers AI response about the answer

    Note over U,LS: === Topic Completion ===
    Note over CI: AI sends [SUMMARY] block
    CI->>CI: LessonSummary renders with useEffect
    CI->>PC: markTopicCompleted(topicId)
    PC->>LS: persist to padhai_progress
    CI->>CI: ChatInput replaced with completion banner
    CI->>CI: "Next Topic" button appears
    U->>CI: Clicks "Next Topic"
    CI->>UC: selectTopic(nextTopicId)
    Note over UC: Fresh chat thread starts
```

## Rich Content Parsing Pipeline

```mermaid
flowchart TB
    AI["Raw AI Response Text<br/>(Hinglish + markers)"]

    AI --> PAR["parseAIResponse(text)"]

    PAR --> RE["Regex scans for:<br/>[DIAGRAM:id] [VIDEO:id]<br/>[QUIZ:MCQ/TYPE]...[/QUIZ]<br/>[SUMMARY]...[/SUMMARY]<br/>[RESOURCES]...[/RESOURCES]<br/>$$...$$"]

    RE --> |"text between markers"| IM["parseInlineMath(text)<br/>splits on $...$"]
    RE --> |"[DIAGRAM:id]"| DB["DiagramBlock<br/>{ type: 'diagram', diagramId }"]
    RE --> |"[VIDEO:id]"| VB["VideoBlock<br/>{ type: 'video', videoId }"]
    RE --> |"[QUIZ:...]...[/QUIZ]"| QB["parseQuizBlock()<br/>{ type: 'quiz', question,<br/>options, answer, explanation }"]
    RE --> |"[SUMMARY]...[/SUMMARY]"| SB["parseSummaryBlock()<br/>{ type: 'summary', content,<br/>keyPoints[] }"]
    RE --> |"[RESOURCES]...[/RESOURCES]"| RB["parseResourcesBlock()<br/>{ type: 'resources', heading,<br/>links[] }"]
    RE --> |"$$...$$"| MBD["MathBlock (display)<br/>{ type: 'math', display: true }"]

    IM --> TB["TextBlock<br/>{ type: 'text', content }"]
    IM --> MBI["MathBlock (inline)<br/>{ type: 'math', display: false }"]

    subgraph Rendering["MessageContent Rendering"]
        TB --> RTB["renderTextWithLineBreaks()<br/>+ bold/italic parsing"]
        MBI & MBD --> ME["MathExpression<br/>(KaTeX)"]
        DB --> DR["DiagramRenderer<br/>→ SVG component lookup"]
        VB --> VE["VideoEmbed<br/>→ YouTube iframe"]
        QB --> QQ["QuizQuestion<br/>(interactive MCQ/type-in)"]
        SB --> LS2["LessonSummary<br/>(+ Next Topic button)"]
        RB --> RCC["ResourceCard<br/>(external links)"]
    end

    subgraph Diagrams["11 SVG Diagram Components"]
        DR --> D1["PolygonIntro"]
        DR --> D2["AngleSum"]
        DR --> D3["GenericQuadrilateral"]
        DR --> D4["Parallelogram"]
        DR --> D5["Rhombus"]
        DR --> D6["Rectangle"]
        DR --> D7["Square"]
        DR --> D8["Kite"]
        DR --> D9["Trapezium"]
        DR --> D10["DiagonalDemo"]
        DR --> D11["QuadrilateralFamily"]
    end
```

## Component Hierarchy & Prop Flow

```mermaid
flowchart TB
    subgraph Root["App Root"]
        BR["BrowserRouter"]
        UP["UserProvider<br/>provides: name, setName"]
    end

    subgraph LearnRoute["/learn Route"]
        PR["ProtectedRoute<br/>(redirects if no name)"]
        CP["ChatProvider<br/>provides: state, dispatch"]
        PP2["ProgressProvider<br/>provides: progress, markTopicCompleted, addQuizResult"]
    end

    subgraph Layout["AppLayout (3-column)"]
        direction LR

        subgraph Left["Left Panel"]
            CS["CurriculumSidebar<br/>props: currentTopicId,<br/>onSelectTopic"]
        end

        subgraph Center["Center Panel"]
            CI["ChatInterface<br/>props: messages, isStreaming,<br/>streamingContent, onSend,<br/>onNextTopic, isTopicCompleted"]

            MB["MessageBubble<br/>props: message, onQuizContinue,<br/>onTopicComplete, onNextTopic"]

            MC["MessageContent<br/>props: blocks[], onQuizContinue,<br/>onTopicComplete, onNextTopic"]

            subgraph Rich["Rich Components"]
                QQ2["QuizQuestion"]
                LS3["LessonSummary"]
                DRR["DiagramRenderer"]
                VEE["VideoEmbed"]
                MEE["MathExpression"]
                RCC2["ResourceCard"]
            end

            CIN["ChatInput<br/>props: onSend, disabled"]
            CB["Completion Banner<br/>(replaces ChatInput)"]
        end

        subgraph Right["Right Panel"]
            PPP["ProgressPanel<br/>uses: useProgress(), useUser()"]
            SC["StatCard × 3<br/>Topics / Score / Accuracy"]
        end
    end

    BR --> UP --> PR --> CP --> PP2 --> Layout
    CI --> MB --> MC --> Rich
    CI --> CIN
    CI -.->|"when completed"| CB
    PPP --> SC
```

## Progress Tracking Flow

```mermaid
flowchart TB
    subgraph Actions["Trigger Points"]
        A1["selectTopic()<br/>(new topic)"]
        A2["LessonSummary<br/>useEffect on mount"]
        A3["QuizQuestion<br/>Check Answer click"]
        A4["ProgressPanel<br/>Reset button"]
    end

    subgraph ProgressCtx["ProgressContext"]
        MTS["markTopicStarted(topicId)<br/>→ started: true"]
        MTC["markTopicCompleted(topicId)<br/>→ completed: true"]
        AQR["addQuizResult(answer)<br/>→ dedupes by quizId<br/>→ stores first attempt only"]
        RP["resetProgress()<br/>→ clears all"]
    end

    subgraph Persist["localStorage: padhai_progress"]
        PD["Record‹topicId, TopicProgress›<br/>{ started, completed,<br/>quizResults[], lastAccessed }"]
    end

    subgraph Display["ProgressPanel"]
        S1["Topics: completedTopics / 11"]
        S2["Score: correctQuizzes / totalQuizzes"]
        S3["Accuracy: (correct/total) × 100%"]
    end

    subgraph SidebarBadges["CurriculumSidebar"]
        B1["✓ green badge<br/>if completed"]
        B2["● blue dot<br/>if started"]
    end

    A1 -->|"new topic"| MTS
    A2 -->|"[SUMMARY] rendered"| MTC
    A3 -->|"answer submitted"| AQR
    A4 -->|"confirm reset"| RP

    MTS & MTC & AQR --> Persist
    RP -->|"clear + reload"| Persist

    Persist --> Display
    Persist --> SidebarBadges
```

## System Prompt Construction

```mermaid
flowchart LR
    subgraph Inputs
        Name["studentName"]
        TID["topicId"]
    end

    subgraph Lookup
        GTB["getTopicById(topicId)<br/>→ topicTitle"]
        TGH["topicGreetingHints[topicId]<br/>→ topic-specific hook"]
    end

    subgraph PromptSections["buildSystemPrompt() Output"]
        P1["1. Persona<br/>PadhAI — warm AI math tutor"]
        P2["2. Language Rules<br/>MUST use Hinglish always"]
        P3["3. Personality<br/>Short msgs, emojis, celebrate"]
        P4["4. Critical Rules<br/>Only relevant diagrams,<br/>unique greetings, auto-advance"]
        P5["5. Teaching Flow<br/>Hook → Explain → Quiz →<br/>Feedback → Summary → Video"]
        P6["6. Rich Content Markers<br/>[DIAGRAM:id] [VIDEO:id]<br/>[QUIZ:MCQ/TYPE] [SUMMARY]<br/>[RESOURCES] $math$"]
        P7["7. NCERT Chapter 3<br/>Full reference material<br/>(all properties & formulas)"]
        P8["8. Current Topic<br/>title + greeting hint"]
    end

    Inputs --> Lookup --> PromptSections
```

## Tech Stack

```mermaid
flowchart LR
    subgraph Frontend
        React["React 19"]
        Vite["Vite 8"]
        TW["Tailwind CSS v4"]
        RR["React Router v7"]
        KT["KaTeX"]
        LR2["Lucide React"]
    end

    subgraph Backend
        NF2["Netlify Functions"]
        SDK["@anthropic-ai/sdk"]
    end

    subgraph AI
        CL2["Claude Sonnet 4"]
    end

    subgraph Deploy
        NP["Netlify<br/>SPA + Serverless"]
    end

    Frontend --> Backend --> AI
    Frontend --> Deploy
    Backend --> Deploy
```
