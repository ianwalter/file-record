import { workspace, TextDocument, ExtensionContext } from 'vscode'
import FileRecord from './fileRecord'

export function activate (context: ExtensionContext) {
  const record = new FileRecord()

  workspace.onDidSaveTextDocument(async (document: TextDocument) => {
    try {
      // If the document version has increased, the new version must be saved.
      const version = await record.getLatestVersion(document.fileName)
      if (document.version > version) {
        await record.saveNewVersion(document)
      }
    } catch (error) {
      console.error(error)
    }
  })
}
