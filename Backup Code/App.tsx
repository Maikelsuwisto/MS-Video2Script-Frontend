import React, { useState } from "react";
import "./App.css";

interface Sentence {
  start?: string;
  end?: string;
  text: string;
}

const App: React.FC = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [withTimestamps, setWithTimestamps] = useState(false);
  const [status, setStatus] = useState("Progress: 0%");
  const [progress, setProgress] = useState(0);
  const [previewText, setPreviewText] = useState("");

  const getTranscribeButtonText = () =>
    withTimestamps ? "🚀 Transcribe with Timestamps" : "🚀 Transcribe without Timestamps";

  // Helper: Split text into sentences
  const splitIntoSentences = (text: string) => {
    return text
      .split(/(?<=[.?!])\s+/)
      .map(sentence => sentence.trim())
      .filter(Boolean);
  };

  const generateTranscription = async () => {
    if (!video) return;

    setLoading(true);
    setStatus("Uploading and transcribing...");
    setProgress(0);
    setPreviewText("");

    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append("video", video);
      formData.append("with_timestamps", withTimestamps ? "1" : "0");

      const response = await fetch("http://localhost:8000/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Backend transcription failed");
      const data = await response.json();

      let textLines: string[] = [];
      if (Array.isArray(data.transcription)) {
        data.transcription.forEach((s: Sentence) => {
          splitIntoSentences(s.text).forEach(sentence => {
            textLines.push(
              withTimestamps && s.start && s.end
                ? `[${s.start} - ${s.end}] ${sentence}`
                : sentence
            );
          });
        });
      }

      setPreviewText(textLines.join("\n\n"));
      setAudioUrl(data.audio_url || null);

      // Calculate total time
      const endTime = Date.now();
      const totalSeconds = Math.floor((endTime - startTime) / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      setStatus(`Transcription complete (⏱ ${minutes}:${seconds.toString().padStart(2, "0")})`);
      setProgress(1);
    } catch (err) {
      console.error(err);
      setStatus("Error during transcription");
      setPreviewText("");
    } finally {
      setLoading(false);
    }
  };

  const downloadTranscription = () => {
    const blob = new Blob([previewText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transcription.txt";
    link.click();
  };

  return (
    <div className="app-container">
      <div className="app-card">
        <h1>🎬 MS-Video2Script</h1>

        {/* Video selector */}
        <div className="video-selector">
          <label>🎬 Select Video File</label>
          <div className="video-input-container">
            <input type="text" readOnly value={video?.name || ""} placeholder="" />
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideo(e.target.files?.[0] || null)}
              style={{ display: "none" }}
              id="fileInput"
            />
            <button onClick={() => document.getElementById("fileInput")?.click()}>📂 Choose File</button>
          </div>
        </div>

        {/* Checkbox */}
        <div className="checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={withTimestamps}
              onChange={(e) => setWithTimestamps(e.target.checked)}
            />{" "}
            Include timestamps
          </label>
        </div>

        {/* Transcribe button */}
        <button
          onClick={generateTranscription}
          disabled={!video || loading}
          className="transcribe-button"
        >
          {getTranscribeButtonText()}
        </button>

        {/* Status & progress */}
        <div className="status-container">
          <p>{status}</p>
          <div className="progress-bar">
            <div className="progress-bar-inner" style={{ width: `${progress * 100}%` }}></div>
          </div>
        </div>

        {/* Preview textbox */}
        <textarea readOnly value={previewText} className="preview-textarea" />

        {/* Download button */}
        <button
          onClick={downloadTranscription}
          disabled={!previewText}
          className="download-button"
        >
          💾 Download Transcription
        </button>

        {/* Optional audio player */}
        {audioUrl && (
          <div className="audio-container">
            <audio controls src={audioUrl}></audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
