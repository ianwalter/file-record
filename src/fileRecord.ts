import { workspace, TextDocument } from 'vscode'
import { resolve, extname, sep } from 'path'
import * as format from 'date-fns/format'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as pify from 'pify'
import * as fpd from 'find-parent-dir'
import * as mkdirpSync from 'mkdirpsync'

const mkdir = pify(mkdirp)
const writeFile = pify(fs.writeFile)
const readDir = pify(fs.readdir)
const findParentDir = pify(fpd)

export default class FileRecord {
  recordPath: any

  constructor () {
    const { recordPath } = workspace.getConfiguration('file-record')
    if (recordPath) {
      this.recordPath = resolve(recordPath)
    } else if (workspace.workspaceFolders) {
      const { fsPath } = workspace.workspaceFolders[0].uri
      this.recordPath = resolve(fsPath, '.vscode/record')
    }

    if (this.recordPath) {
      mkdirpSync(this.recordPath)
      const gitignore = resolve(this.recordPath, '.gitignore')
      if (!fs.existsSync(gitignore)) {
        writeFile(gitignore, '*')
      }
    }
  }

  async getLatestVersion (filename: string) {
    try {
      const dir = await this.file(filename)
      if (dir) {
        const files = await readDir(dir)
        if (files.length) {
          files.sort((a, b) => b - a)
          const result = /\.([0-9]+)\./.exec(files[0])
          return result[1]
        }
      }
    } finally {
      return 0
    }
  }

  async file (filename: string) {
    try {
      if (filename.includes('.vscode/record')) {
        throw new Error('Not creating a file record of an existing file record')
      }

      if (!this.recordPath) {
        const dir = await findParentDir('.vscode')
        if (dir) {
          this.recordPath = resolve(dir, 'record')
        } else {
          throw new Error(`Couldn't determine the project root directory`)
        }
      }

      if (filename.includes(resolve(this.recordPath, '../..'))) {
        const relativePath = workspace.asRelativePath(filename)

        // Add .record to each path segment so that the directories that contain
        // the records don't match the original filename exactly.
        // https://github.com/ianwalter/file-record/issues/2
        const pathParts = relativePath.split(sep).map(p => p + '.record')

        return resolve(this.recordPath, pathParts.join(sep))
      } else {
        throw new Error(`Filename doesn't match workspace path`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  async saveNewVersion (document: TextDocument) {
    const dirPath = await this.file(document.fileName)
    const ext = extname(document.fileName)
    const date = format(new Date(), 'MM-DD-YYYY hh-mm-ssa')
    const filename = `${date}.${document.version}${ext}`
    if (dirPath) {
      //
      await mkdir(dirPath)

      //
      await writeFile(resolve(dirPath, filename), document.getText())
    }
  }
}
