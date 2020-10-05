import { message } from './index'

describe('index.ts', () => {
  it('Works', () => {
    expect(message).toMatchSnapshot()
  })
})
