// Google Apps Script: crea una sesión de subida directa a una carpeta de Drive
// y guarda la descripción de cada archivo como .txt con el mismo nombre.
// La web sube el archivo directamente a Drive (sin límite de Apps Script para vídeos grandes).

const FOLDER_ID = "14dyauuKRiN5smHlAt3iLhS-SQqh2C31X"; // lo que va tras /folders/ en la URL de Drive

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);

    // Segunda llamada: guarda la descripción como .txt con el mismo nombre que el archivo
    if (d.action === "text") {
      const base = clean(d.base).replace(/\.[^.]*$/, "");
      DriveApp.getFolderById(FOLDER_ID).createFile(base + ".txt", String(d.text || "").slice(0, 2000), MimeType.PLAIN_TEXT);
      return out({ ok: true });
    }

    if (!/^(image|video)\//.test(d.mime || "")) return out({ error: "Tipo no permitido" });

    const name = clean(d.name || "archivo");
    const stamp = Utilities.formatDate(new Date(), "Europe/Madrid", "yyyyMMdd-HHmmss");

    const resp = UrlFetchApp.fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true",
      {
        method: "post",
        contentType: "application/json; charset=UTF-8",
        headers: {
          Authorization: "Bearer " + ScriptApp.getOAuthToken(),
          "X-Upload-Content-Type": d.mime,
          Origin: d.origin || ""
        },
        payload: JSON.stringify({ name: stamp + "_" + name, parents: [FOLDER_ID] }),
        muteHttpExceptions: true
      }
    );
    const loc = resp.getHeaders()["Location"] || resp.getHeaders()["location"];
    if (!loc) return out({ error: "No se pudo iniciar la subida (" + resp.getResponseCode() + "): " + resp.getContentText().slice(0, 300) });
    return out({ url: loc, base: (stamp + "_" + name).replace(/\.[^.]*$/, "") });
  } catch (err) {
    return out({ error: String(err) });
  }
}

function clean(s) {
  return String(s).replace(/[\\/:*?"<>|]/g, "_").slice(0, 120);
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
