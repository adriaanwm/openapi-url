import { describe, it, expect } from 'bun:test'
import { ListQueryStyle, urlBuilder } from '../src'
import { paths as Paths } from '../openapitypes'

const BASE_URL = 'http://example.com'

const url = urlBuilder<Paths>({
  baseUrl: BASE_URL
})

describe('should', () => {
  it('build url', () => {
    const u = url({ path: '/pet', method: 'put' })
    expect(u.href).toBe(`${BASE_URL}/pet`)
  })
  it('build url with queries', () => {
    const u = url({
      path: '/pet/findByTags',
      method: 'get',
      queries: {
        tags: ['one', 'two']
      }
    })
    expect(u.href).toBe(`${BASE_URL}/pet/findByTags?tags=one%2Ctwo`)
  })
  it('build url with queries repeat list option', () => {
    const u = url({
      path: '/pet/findByTags',
      method: 'get',
      queries: {
        tags: ['one', 'two']
      },
      options: {
        listQueryStyle: ListQueryStyle.repeatQuery
      }
    })
    expect(u.href).toBe(`${BASE_URL}/pet/findByTags?tags=one&tags=two`)
  })
  it('url with path arguments', () => {
    const u = url({ path: '/pet/{petId}', method: 'get', args: {petId: 123} })
    expect(u.href).toBe(`${BASE_URL}/pet/123`)
  })
})
