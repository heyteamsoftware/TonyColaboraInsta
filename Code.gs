// Google Apps Script: crea una sesión de subida directa a una carpeta de Drive.
// La web sube el archivo directamente a Drive (sin límite de Apps Script para vídeos grandes).

const FOLDER_ID = "14dyauuKRiN5smHlAt3iLhS-SQqh2C31X"; // lo que va tras /folders/ en la URL de Drive
const MAX_BYTES = 500 * 1024 * 1024;

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (!/^(image|video)\//.test(d.mime || "")) return out({ error: "Tipo no permitido" });

    const name = String(d.name || "archivo").replace(/[\\/:*?"<>|]/g, "_").slice(0, 120);
    const stamp = Utilities.formatDate(new Date(), "Europe/Madrid", "yyyyMMdd-HHmmss");

    const resp = UrlFetchApp.fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true",
      {
        method: "post",
        contentType: "application/json; charset=UTF-8",
        headers: {
          Authorization: "Bearer " + ScriptApp.getOAuthToken(),
          "X-Upload-Content-Type": d.mime,
          "X-Upload-Content-Length-Max": String(MAX_BYTES),
          Origin: d.origin || ""
        },
        payload: JSON.stringify({ name: stamp + "_" + name, parents: [FOLDER_ID] }),
        muteHttpExceptions: true
      }
    );
    const loc = resp.getHeaders()["Location"] || resp.getHeaders()["location"];
    if (!loc) return out({ error: "No se pudo iniciar la subida (" + resp.getResponseCode() + ")" });
    return out({ url: loc });
  } catch (err) {
    return out({ error: String(err) });
  }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
