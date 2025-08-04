document.getElementById("fileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const filename = document.getElementById("filename").value.trim();
  const content = document.getElementById("content").value;

  await fetch("/save-file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, content }),
  });

  alert("Archivo guardado correctamente");
});

fetch("/save-file", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ filename, content }),
})
  .then((res) => res.text())
  .then((msg) => alert(msg));
