import { workspace, TextDocument, ExtensionContext } from 'vscode'
import FileRecord from './fileRecord'

export function activate (context: ExtensionContext) {
  const record = new FileRecord()

  //
  setInterval(record.handleBatch, record.saveDelay)

  workspace.onDidSaveTextDocument(async (document: TextDocument) => {
    try {
      // If the document version has increased, save the new version.
      const version = await record.getLatestVersion(document.fileName)
      if (document.version > version) {
        record.addToBatch(document)
      }
    } catch (error) {
      console.error(error)
    }
  })
}
