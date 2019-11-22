var crypto = require("crypto")

const encryptSync = function(secret_key, clear_text, options={iv_length:16,algorithm:'aes-256-gcm',encoding:'base64'}){
  const iv_length = options.iv_length || 16
  const algorithm = options.algorithm || 'aes-256-gcm'
  const encoding = options.encoding || 'base64'
  const authAlgos = ['gcm']
  const isAuthAlgo = algorithm.substr(-3).indexOf(authAlgos)!=-1

  const ivBuf = Buffer.from(crypto.randomBytes(iv_length), 'utf8')
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret_key), ivBuf)

  try {
    const result =  `${cipher.update(clear_text, "utf8", encoding)}${cipher.final(encoding)}`
    return [ivBuf.toString(encoding), result, (isAuthAlgo?cipher.getAuthTag().toString(encoding):'')]
  } catch (err) {
    return err
  }
}

const decryptSync = function(secret_key, [enc_iv, enc_text, enc_auth], options={algorithm:'aes-256-gcm',encoding:'base64'}){
  const algorithm = options.algorithm || 'aes-256-gcm'
  const encoding = options.encoding || 'base64'
  const authAlgos = ['gcm']
  const isAuthAlgo = algorithm.substr(-3).indexOf(authAlgos)!=-1

  const authBuf = isAuthAlgo?Buffer.from(enc_auth, encoding):''
  const ivBuf = Buffer.from(enc_iv, encoding)
  const textBuf = Buffer.from(enc_text, encoding)
   
  try {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret_key), ivBuf)
    if(isAuthAlgo) {
      decipher.setAuthTag(authBuf)
    }
    var result = decipher.update(textBuf, encoding, 'utf8')
    result += decipher.final('utf8')

    return result
  } catch (err){

    return err
  }

}



const encrypt = function(secret_key, clear_text, options={iv_length:16,algorithm:'aes-256-gcm',encoding:'base64'}){
  const iv_length = options.iv_length || 16
  const algorithm = options.algorithm || 'aes-256-gcm'
  const encoding = options.encoding || 'base64'
  const authAlgos = ['gcm']
  const isAuthAlgo = algorithm.substr(-3).indexOf(authAlgos)!=-1

  return new Promise( (resolve, reject) => {
    const ivBuf = Buffer.from(crypto.randomBytes(iv_length), 'utf8')
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret_key), ivBuf)

    try {
      const result =  `${cipher.update(clear_text, "utf8", encoding)}${cipher.final(encoding)}`
      resolve([ivBuf.toString(encoding), result, (isAuthAlgo?cipher.getAuthTag().toString(encoding):'')])
    } catch (err) {
      reject(err)
    }

  })
}

const decrypt = function(secret_key, [enc_iv, enc_text, enc_auth], options={algorithm:'aes-256-gcm',encoding:'base64'}){
  const algorithm = options.algorithm || 'aes-256-gcm'
  const encoding = options.encoding || 'base64'
  const authAlgos = ['gcm']
  const isAuthAlgo = algorithm.substr(-3).indexOf(authAlgos)!=-1

  return new Promise( (resolve, reject) => {

    const authBuf = isAuthAlgo?Buffer.from(enc_auth, encoding):''
    const ivBuf = Buffer.from(enc_iv, encoding)
    const textBuf = Buffer.from(enc_text, encoding)

    
    try {

      const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret_key), ivBuf)
      if(isAuthAlgo) {
        decipher.setAuthTag(authBuf)
      }
      var result = decipher.update(textBuf, encoding, 'utf8')
      result += decipher.final('utf8')

      resolve(result)
    } catch (err){

      reject(err)
    }
  })

}

module.exports = {encrypt, decrypt, encryptSync, decryptSync}
