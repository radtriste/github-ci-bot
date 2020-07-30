const ci = require('../src/lib/ci')
jest.mock('../src/lib/utils')
const { getChangedFiles: getChangedFilesMock } = require('../src/lib/utils')

test('is CI required true', async () => {
  // Arrange
  const context = { config: jest.fn(path => path === 'bot-files/paths.yml' ? { files: ['Jenkinsfile', 'test/**', 'cmd/**', 'pkg/**'] } : undefined) }
  getChangedFilesMock.mockImplementationOnce(cntxt => cntxt === context ? ['test/file-a', 'cmd/file-a', 'pkg/file-a', 'otherfolder/file-a'] : undefined)
  // Act
  const result = await ci.isCIRequired(context)
  // Assert
  expect(result)
})

test('is CI required false', async () => {
  // Arrange
  const context = { config: jest.fn(path => path === 'bot-files/paths.yml' ? { files: ['Jenkinsfile', 'test/**', 'cmd/**', 'pkg/**'] } : undefined) }
  getChangedFilesMock.mockImplementationOnce(cntxt => cntxt === context ? ['otherfolder/file-a'] : undefined)
  // Act
  const result = await ci.isCIRequired(context)
  // Assert
  expect(!result)
})
