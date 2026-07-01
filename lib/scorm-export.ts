import JSZip from "jszip"
import type { CourseForm } from "@/components/instructor/CourseEditor"

// ── SCORM Manifest Generator ──────────────────────────────────────────────────

function generateManifest(course: CourseForm): string {
  const scos = course.sections.flatMap((sec, sIdx) =>
    sec.lessons.map((les, lIdx) => ({
      id: `sco-${sIdx}-${lIdx}`,
      lessonId: les.id,
      sectionIdx: sIdx,
      lessonIdx: lIdx,
    }))
  )

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="manifest-${Date.now()}" version="1.0"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
                      http://www.adlnet.org/xsd/adlcp_v1p2 adlcp_v1p2.xsd">

  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>

  <organizations default="org-1">
    <organization identifier="org-1" structure="hierarchical">
      <title>${escapeXml(course.title)}</title>
      <description>${escapeXml(course.description)}</description>
      ${course.sections.map((section, sIdx) => `
      <item identifier="sec-${sIdx}" isvisible="true">
        <title>${escapeXml(section.title)}</title>
        ${section.lessons.map((lesson, lIdx) => `
        <item identifier="sco-${sIdx}-${lIdx}" identifierref="res-${sIdx}-${lIdx}" isvisible="true">
          <title>${escapeXml(lesson.title)}</title>
          <adlcp:completionThreshold minProgressMeasure="0.0" progressWeight="1.0" completionStatus="completed"/>
        </item>`).join("")}
      </item>`).join("")}
    </organization>
  </organizations>

  <resources>
    ${scos.map(sco => {
      const lesson = course.sections[sco.sectionIdx].lessons[sco.lessonIdx]
      return `
    <resource identifier="res-${sco.sectionIdx}-${sco.lessonIdx}"
              type="webcontent"
              adlcp:scormType="sco"
              href="lessons/${sco.id}.html">
      <file href="lessons/${sco.id}.html"/>
    </resource>`
    }).join("")}
  </resources>
</manifest>`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

// ── SCO Wrapper Generators ────────────────────────────────────────────────────

function generateVideoLessonSCO(lesson: any, videoUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(lesson.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { margin-top: 0; color: #1e293b; }
    video { width: 100%; max-width: 800px; border-radius: 4px; margin: 20px 0; }
    .status { padding: 12px; background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px; }
    .status.complete { background: #e8f5e9; border-left-color: #4caf50; color: #2e7d32; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(lesson.title)}</h1>
    <video id="lesson-video" controls preload="metadata">
      <source src="${escapeHtml(videoUrl)}" type="video/mp4">
      Your browser does not support HTML5 video.
    </video>
    <div class="status" id="status">
      📺 Watch at least 80% of the video to mark this lesson complete.
    </div>
  </div>

  <script src="../scorm-api.js"><\/script>
  <script>
    let scorm = window.SCORM || {};
    let videoWatched = false;

    scorm.init();

    const video = document.getElementById("lesson-video");
    video.addEventListener("timeupdate", () => {
      if (!videoWatched && video.duration > 0) {
        const watchedPercent = (video.currentTime / video.duration) * 100;
        if (watchedPercent >= 80) {
          videoWatched = true;
          const status = document.getElementById("status");
          status.innerHTML = "✓ Video watched (80%+) — lesson complete!";
          status.classList.add("complete");

          scorm.set("cmi.core.lesson_status", "completed");
          scorm.set("cmi.core.score.raw", "100");
          scorm.commit();
        }
      }
    });

    window.addEventListener("beforeunload", () => {
      scorm.finish();
    });
  <\/script>
</body>
</html>`
}

function generateQuizLessonSCO(lesson: any, questions: any[]): string {
  const questionsJson = JSON.stringify(questions)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(lesson.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { margin-top: 0; color: #1e293b; }
    .question { margin: 20px 0; padding: 15px; border: 1px solid #e2e8f0; border-radius: 4px; }
    .question-text { font-weight: 600; color: #1e293b; margin-bottom: 10px; }
    .option { margin: 10px 0; display: flex; align-items: center; }
    .option input { margin-right: 10px; cursor: pointer; }
    .option label { cursor: pointer; color: #475569; }
    button {
      background: #3b82f6;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      margin-top: 20px;
      transition: background 0.2s;
    }
    button:hover { background: #2563eb; }
    button:disabled { background: #cbd5e1; cursor: not-allowed; }
    .result { margin-top: 20px; padding: 15px; border-radius: 4px; font-weight: 600; }
    .result.pass { background: #e8f5e9; color: #2e7d32; border-left: 4px solid #4caf50; }
    .result.fail { background: #ffebee; color: #c62828; border-left: 4px solid #ef5350; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(lesson.title)}</h1>
    <form id="quiz-form">
      <div id="questions-container"></div>
      <button type="submit" id="submit-btn">Submit Quiz</button>
    </form>
    <div id="result"></div>
  </div>

  <script src="../scorm-api.js"><\/script>
  <script>
    const questions = ${questionsJson};
    let scorm = window.SCORM || {};

    scorm.init();

    // Render quiz questions
    const container = document.getElementById("questions-container");
    questions.forEach((q, idx) => {
      const qDiv = document.createElement("div");
      qDiv.className = "question";

      let optionsHtml = "";
      if (q.options && Array.isArray(q.options)) {
        optionsHtml = q.options.map((opt, optIdx) => \`
          <div class="option">
            <input type="radio" id="q\${idx}-o\${optIdx}" name="q\${idx}" value="\${optIdx}">
            <label for="q\${idx}-o\${optIdx}">\${opt}</label>
          </div>
        \`).join("");
      }

      qDiv.innerHTML = \`
        <div class="question-text">Q\${idx + 1}: \${q.question}</div>
        \${optionsHtml}
      \`;
      container.appendChild(qDiv);
    });

    // Handle submission
    document.getElementById("quiz-form").addEventListener("submit", (e) => {
      e.preventDefault();

      let score = 0;
      questions.forEach((q, idx) => {
        const selected = document.querySelector(\`input[name="q\${idx}"]:checked\`);
        if (selected && parseInt(selected.value) === q.correctIndex) {
          score++;
        }
      });

      const percent = Math.round((score / questions.length) * 100);
      const passed = percent >= 70;

      const resultDiv = document.getElementById("result");
      resultDiv.className = \`result \${passed ? "pass" : "fail"}\`;
      resultDiv.innerHTML = \`
        <div>\${passed ? "✓ Quiz Passed!" : "✗ Quiz Failed"}</div>
        <div>Score: \${score}/\${questions.length} (\${percent}%)</div>
      \`;

      scorm.set("cmi.core.lesson_status", passed ? "passed" : "completed");
      scorm.set("cmi.core.score.raw", percent.toString());
      scorm.commit();

      document.getElementById("quiz-form").style.display = "none";
      document.getElementById("submit-btn").disabled = true;
    });

    window.addEventListener("beforeunload", () => {
      scorm.finish();
    });
  <\/script>
</body>
</html>`
}

function generateTextLessonSCO(lesson: any): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(lesson.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #1e293b; }
    #content { line-height: 1.6; color: #475569; margin: 20px 0; }
    button {
      background: #3b82f6;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: background 0.2s;
    }
    button:hover { background: #2563eb; }
    .complete { background: #e8f5e9; border: 1px solid #4caf50; color: #2e7d32; cursor: default; }
    .complete:hover { background: #e8f5e9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(lesson.title)}</h1>
    <div id="content">
      <p><em>Text content lesson</em></p>
    </div>
    <button id="complete-btn" onclick="markComplete()">Mark as Complete</button>
  </div>

  <script src="../scorm-api.js"><\/script>
  <script>
    let scorm = window.SCORM || {};
    scorm.init();

    function markComplete() {
      scorm.set("cmi.core.lesson_status", "completed");
      scorm.set("cmi.core.score.raw", "100");
      scorm.commit();

      const btn = document.getElementById("complete-btn");
      btn.innerHTML = "✓ Lesson Complete";
      btn.classList.add("complete");
      btn.disabled = true;
    }

    window.addEventListener("beforeunload", () => {
      scorm.finish();
    });
  <\/script>
</body>
</html>`
}

function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return str.replace(/[&<>"']/g, (c) => map[c])
}

// ── SCORM API Shim ───────────────────────────────────────────────────────────

function generateSCORMAPI(): string {
  return `// SCORM 1.2 API Shim
// When loaded inside a real LMS, window.parent.API is replaced with the actual LMS API
// For standalone/testing, this shim simulates the behavior

if (!window.API && window.parent && window.parent.API) {
  window.API = window.parent.API;
}

window.SCORM = {
  data: {
    "cmi.core.lesson_status": "incomplete",
    "cmi.core.score.raw": "0",
    "cmi.core.student_name": "Learner",
    "cmi.core.student_id": "unknown",
  },

  init: function() {
    if (window.API && window.API.LMSInitialize) {
      window.API.LMSInitialize("");
      return "0";
    }
    console.log("[SCORM] Initialized (standalone mode)");
    return "0";
  },

  set: function(key, value) {
    this.data[key] = value;
    if (window.API && window.API.LMSSetValue) {
      window.API.LMSSetValue(key, value);
    }
    console.log("[SCORM] Set " + key + " = " + value);
    return "0";
  },

  get: function(key) {
    if (window.API && window.API.LMSGetValue) {
      return window.API.LMSGetValue(key);
    }
    return this.data[key] || "";
  },

  commit: function() {
    if (window.API && window.API.LMSCommit) {
      window.API.LMSCommit("");
    }
    console.log("[SCORM] Committed", this.data);
    return "0";
  },

  finish: function() {
    if (window.API && window.API.LMSFinish) {
      window.API.LMSFinish("");
    }
    console.log("[SCORM] Finished", this.data);
    return "0";
  },
};
`
}

// ── Main Export Function ──────────────────────────────────────────────────────

export async function exportCourseAsSCORM(course: CourseForm): Promise<Blob> {
  const zip = new JSZip()

  // Add manifest
  zip.file("imsmanifest.xml", generateManifest(course))

  // Add SCORM API shim to root
  zip.file("scorm-api.js", generateSCORMAPI())

  // Generate SCO for each lesson
  for (const [sIdx, section] of course.sections.entries()) {
    for (const [lIdx, lesson] of section.lessons.entries()) {
      const scoId = `sco-${sIdx}-${lIdx}`
      let scoHtml = ""

      switch (lesson.type) {
        case "video": {
          let videoPath = ""
          // If video URL is a blob: URL, fetch and embed it; otherwise use the URL as-is
          if (lesson.videoUrl) {
            if (lesson.videoUrl.startsWith("blob:")) {
              try {
                const response = await fetch(lesson.videoUrl)
                const blob = await response.blob()
                const videoFileName = lesson.videoFileName || `video.mp4`
                videoPath = `../videos/${scoId}.${getFileExtension(videoFileName)}`
                zip.file(`videos/${scoId}.${getFileExtension(videoFileName)}`, blob)
              } catch (err) {
                console.error(`Failed to embed video for lesson ${lesson.title}:`, err)
                videoPath = lesson.videoUrl // Fall back to original URL if fetch fails
              }
            } else {
              // Use public URL as-is
              videoPath = lesson.videoUrl
            }
          }
          scoHtml = generateVideoLessonSCO(lesson, videoPath)
          break
        }
        case "quiz":
          scoHtml = generateQuizLessonSCO(lesson, lesson.questions || [])
          break
        case "text":
          scoHtml = generateTextLessonSCO(lesson)
          break
        default:
          scoHtml = generateTextLessonSCO(lesson)
      }

      zip.file(`lessons/${scoId}.html`, scoHtml)
    }
  }

  return zip.generateAsync({ type: "blob" })
}

function getFileExtension(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "mp4"
  return /^(mp4|webm|ogg|mov)$/.test(ext) ? ext : "mp4"
}
