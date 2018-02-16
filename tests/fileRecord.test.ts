import FileRecord from '../src/fileRecord'

describe('FileRecord', () => {
  describe('.getLatestVersion()', () => {
    test('returns correct version of latest existing file', () => {

    })

    test('returns 0 when no file record exists', () => {

    })
  })

  describe('.file()', () => {
    test('returns undefined when recordPath cannot be determined', () => {

    })

    test('returns undefined when filepath does not match recordPath', () => {

    })

    test('returns the correct file record path', () => {

    })
  })

  describe('.addToQueue()', () => {
    test('add a changed document to the batch', () => {

    })
  })

  describe('.processQueue()', () => {
    test('saves file records from the queue to the filesystem', () => {

    })
  })

  describe('.saveNewVersion()', () => {
    test('saves a file record to the filesystem', () => {

    })
  })
})
