import { workspace, TextDocument } from 'vscode'
import { resolve, extname } from 'path'
import { DateTime } from 'luxon'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as pify from 'pify'
import * as fpd from 'find-parent-dir'

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
        return resolve(this.recordPath, relativePath)
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
    const date = DateTime.local().toLocaleString(DateTime.DATETIME_MED)
    const filename = `${date}.${document.version}${ext}`
    if (dirPath) {
      //
      await mkdir(dirPath)

      //
      await writeFile(resolve(dirPath, filename), document.getText())
    }
  }
}
