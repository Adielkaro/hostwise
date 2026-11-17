setInterval(async () => {
  try {
    const res = await fetch("http://localhost:3000/api/sync-sheets");
    const data = await res.json();
    console.log(new Date().toLocaleTimeString(), "- Synced:", data.synced || 0, "leads");
  } catch (e) {
    console.error("Sync error:", e.message);
  }
}, 60000);

console.log("Auto-sync started (every 60 seconds)");
console.log("Press Ctrl+C to stop");