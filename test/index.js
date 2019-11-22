import { expect } from 'chai'
import {encrypt, decrypt, encryptSync, decryptSync} from '../src'

describe('encryptio()', () => {
	describe('Simple', () => {
    it('Asynchronous encryption and decryption works', () => {
      var clear_text = 'Hello World'
      encrypt('0123456789!@#$%^&*()qwertyuiopMN', clear_text).then( encText => {
        decrypt('0123456789!@#$%^&*()qwertyuiopMN', encText).then( decText => {
          expect(decText).to.deep.equal(clear_text)
        })
      })
    })
    it('Synchronous encryption and decryption works', () => {
      var clear_text = 'Hello World'
      var encText = encryptSync('0123456789!@#$%^&*()qwertyuiopMN', clear_text)
      var decText = decryptSync('0123456789!@#$%^&*()qwertyuiopMN', encText)
      expect(decText).to.deep.equal(clear_text)
    })
  })
	describe('Custom Params', () => {
    it('Asynchronous encryption and decryption without auth works', () => {
      var clear_text = 'Hello World'
      encrypt('0123456789!@#$%^&*()qwertyuiopMN', clear_text, {algorithm:'aes-256-cbc'}).then( encText => {
        decrypt('0123456789!@#$%^&*()qwertyuiopMN', encText, {algorithm:'aes-256-cbc'}).then( decText => {
          expect(decText).to.deep.equal(clear_text)
        })
      })
    })
    it('Synchronous encryption and decryption without auth works', () => {
      var clear_text = 'Hello World'
      var encText = encryptSync('0123456789!@#$%^&*()qwertyuiopMN', clear_text, {algorithm:'aes-256-cbc'})
      var decText = decryptSync('0123456789!@#$%^&*()qwertyuiopMN', encText, {algorithm:'aes-256-cbc'})
      expect(decText).to.deep.equal(clear_text)
    })
  })
})
