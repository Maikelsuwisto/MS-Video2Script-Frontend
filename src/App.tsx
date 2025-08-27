import React, { useState, useEffect } from "react";
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

  // Fake alive progress bar
  useEffect(() => {
    let interval: number | undefined; // declare before if-block

    if (loading) {
      setProgress(0);
      interval = window.setInterval(() => {
        setProgress(prev => {
          if (prev < 0.95) return prev + Math.random() * 0.02;
          return prev;
        });
      }, 200);
    } else {
      setProgress(1);
    }

    return () => {
      if (interval) window.clearInterval(interval); // safe now
    };
  }, [loading]);


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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/transcribe`, {
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Response is not JSON");
      }

      if (!response.ok) {
        throw new Error(data.detail || "Backend transcription failed");
      }
      let textLines: string[] = [];
      if (Array.isArray(data.transcription)) {
        data.transcription.forEach((s: Sentence) => {
          splitIntoSentences(s.text).forEach(sentence => {
            textLines.push(
              withTimestamps && s.start && s.end
                ? `[${s.start} - ${s.end}] \n${sentence}`
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
