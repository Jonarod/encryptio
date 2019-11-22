![npm bundle size](https://img.shields.io/bundlephobia/minzip/encryptio.svg?label=gzipped%20size&style=flat-square)

Simple, yet secure, encryption / decryption using Javascript.

- **ZERO dependencies:** uses `crypto` which natively ships with Node.js without any further install
- **Tree-shakeable:** import only functions you need.
- **Random:** Encrypted strings are always different *( using Initialization Vector )*
- **Asynchronous or Synchronous:** Choose between promise-based (`.then()` or `async/await`) or Sync
- **Options:** support manual algorithms and encodings (see the `Options` section)


# Quick start

`npm install encryptio`


#### Asynchronous (default):

```js
var encrypt = require('encryptio').encrypt
var decrypt = require('encryptio').decrypt
// or using ES6:
import {encrypt, decrypt} from 'encryptio'

var MY_SECRET = process.env.SECRET_KEY // See note on "storing the secret key"
                                       // secret_key should be 32 characters for AES256

var main = async function(){
    var clearText = 'Hello World'
    console.log('Original string: ', clearText)

    var encText = await encrypt(MY_SECRET, clearText)    // Note thay encrypt() outputs
                                                         // an array as follow:
                                                         // [IV, String, Auth]
    console.log('Encrypted string: ', encText.join('.')) 


    var decText = await encrypt(MY_SECRET, encText)      // Note that decrypt() needs
                                                         // an array as follow
                                                         // [IV, String, Auth]
    console.log('Encrypted string: ', decText)
}

main()

// > prints:
// Original string: Hello World
// Encrypted string: 5lSto7M4riJKmorPvrToBQ==.qmZZr48DEDYARyQ=.okPYfpnuBj24UDMrdKEYKQ==
// Decrypted string: Hello World
```

#### Synchronous

```js
var encrypt = require('encryptio').encrypt
var decrypt = require('encryptio').decrypt
// or using ES6:
import {encryptSync, decryptSync} from 'encryptio'

var MY_SECRET = process.env.SECRET_KEY // See note on "storing the secret key"
                                       // secret_key should be 32 characters for AES256

var clearText = 'Hello World'
console.log('Original string: ', clearText)

var encText = encryptSync(MY_SECRET, clearText)
console.log('Encrypted string: ', encText)

var decText = decryptSync(MY_SECRET, encText)
console.log('Encrypted string: ', decText)

// > prints:
// Original string: Hello World
// Encrypted string: 5lSto7M4riJKmorPvrToBQ==.qmZZr48DEDYARyQ=.okPYfpnuBj24UDMrdKEYKQ==
// Decrypted string: Hello World
```

# Why encrypt() outputs 3 things in an array ?

Well, `encrypt()` and `encryptSync()` output an array in the form of:

```js
let [IV, EncString, Auth] = encrypt(process.env.SECRET_KEY, 'Hello')
```

The same array is expected to be provided to `decrypt()` and `decryptSync()`:

```js
decrypt(process.env.SECRET_KEY, [IV, EncString, Auth])
```

Here is what they represent:

- **IV** is the Initialization Vector (=the seed). It is mandatory in GCM, CBC and CTR. Since the IV is changed at each encryption, the `decrypt()` function needs to know the seed to calculate the correct decryption.

- **EncString** is the actual encrypted string.

- **Auth** is the signature part for the authentication. It is output (and required) only if the `algorithm` ends by `gcm` (like the default `aes-256-gcm`). If non-auth algorithms are used, like `aes-256-cbc` for example, this `Auth` part is not output in `encrypt()` nor `encryptSync()`, and not required in `decrypt()` nor `decryptSync()`.


##### Why the fuzz ?? Why not just concatenate everything off the bat in the library ?!

Short answer, for modularity.

Long answer: one can decide to apply further transformation to each part of the output. For example apply a salt. Another thing is how to store these parts: one could eventually store each part in separate stores. Finally, one could trim off some part of the `IV` and `Auth` string when using `base64` encoding (default).


# Options

By default, `encryptio` uses `aes_256_gcm` algorithm to encrypt strings and `base64` to encode them.

Both options are manually configurable. Just pass an object to encrypt/decrypt functions like so:

```js
var custom_options = {
    algorithm: 'aes-256-cbc',
    encoding: 'hex'
}

var main = async function(){
    const clearText = 'Hello World';
    const encText = await encrypt(process.env.SECRET_KEY, clearText, custom_options);
    await decrypt(process.env.SECRET_KEY, encText, custom_options);

    // or using Sync
    const encText = encryptSync(process.env.SECRET_KEY, clearText, custom_options);
    decryptSync(process.env.SECRET_KEY, encText, custom_options);
}

```

There are a lot of options to choose from when it comes to encryption. CBC, CTR and GCM are the most used and most secure. Actually, a lot of examples on tutorials use CBC, but this should not be the best practice to widespread. In fact, CBC is a strong encryption algorithm but it lacks authentication and should be used with an extra layer of authentication like HMAC or else... GCM has the advantage of combining both encryption + authentication, making it a better choice for most situations.


##### algorithm

- `aes-256-gcm` **(default)** : requires a 32 byte secret key. Has Auth.
- `aes-256-ctr` : requires a 32 byte secret key. No Auth.
- `aes-256-cbc` : requires a 32 byte secret key. No Auth.
- ... : there are a lot of other algorithms. Really, stick to one of those 3, or better: keep it to default `aes-256-gcm`.


##### encoding

- `base64` **(default)**: output balanced size readable strings
- `hex`: output readable strings larger than `base64`
- `binary`: output compact strings but not readable (ok for inter-machine but cannot share with humans)


# Note on storing the secret key

**!! NEVER PUT YOUR SECRET KEY IN YOUR CODE !!**

**!! NEVER PUT YOUR SECRET KEY IN YOUR CODE !!**

**!! NEVER PUT YOUR SECRET KEY IN YOUR CODE !!**


> It is strongly recommended to store any private key or secret localy (on a secured machine...) and never send these to the cloud or even to git or even to team mates. Here are 3 recommended ways to store them:


### Quick and dirty

Export a variable in your terminal before `node`:

```bash
SECRET_KEY=1234567890098765432112 node index.js
```
Then in your code (here `index.js` as an example), you can call your variable like this:

```js
// index.js
// ...
var my_secret = process.env.SECRET_KEY
// ...
```

### Using `direnv` (recommended)

[direnv](https://direnv.net/) solves this problem quite nicely. First you install `direnv` (just go and follow the steps in `direnv` docs). Then, at the root of your project, you can create a file named `.envrc` and put your secrets like so:

```bash
# in your .envrc
export SECRET_KEY=1234567890098765432112
```

Then in your code (here `index.js` as an example), you can call your variable like this:

```js
// in your index.js
// ...
var my_secret = process.env.SECRET_KEY
// ...
```

**CAUTION:** Please, make **100% sure** that your `.envrc` is never sent to git or anywhere. It should just be kept secret in your machine. So, do not forget to update your `.gitignore` file accordingly:

```bash
# in your .gitignore
# exclude direnv file
.envrc
```

### Using `dotenv`

[dotenv](https://github.com/motdotla/dotenv) does somewhat the same thing as `direnv` but has to be explicitly added to your code.

First create a `.env` file at the root of your project:

```
SECRET_KEY=1234567890098765432112
```

then install `dotenv`

`npm i dotenv --save`

finally in your code, import `dotenv`, and get your vars:

```js
// in your index.js
require('dotenv').config()

var my_secret = process.env.SECRET_KEY
```

**CAUTION:** Please, make **100% sure** that your `.env` is never sent to git or anywhere. It should just be kept secret in your machine. So, do not forget to update your `.gitignore` file accordingly:

```bash
# in your .gitignore
# exclude dotenv file
.env
```


# How secure is this ?

##### DOs

You can safely use the lib to encrypt low to highly confidential things.

**!! USE A REALLY RANDOM SECRET KEY !!**

Just to recap, here are some common things adressed:

- This is `AES-256-GCM` by default. One cool thing about it is that the encryption is not made by blocks of words but rather given the whole string. So it is not possible to statistically count word/letter frequencies against the encrypted string.

- `AES-256-GCM` enforces a 32 bytes long secret key composed of any `utf-8` characters. It would require billions of billions of years to try all possibilities of the secret key. That beinng said, if your secret key is `00000000000000000000000000000000` it may take only 2 minutes... since any brute-force program might just start with easy strings first (zeros, sequences, words dictionnaries...). **So make it is VITAL to make your secret as random as possible !**

- `AES-256-GCM` combines encryption with a signature for authentication. This means that one first step is made to obfuscate the original string, but a second step is made to sign the encrypted string so that an attacker cannot forge the encrypted string. If an attacker attempts to modify the encrypted string (trying to insert/guess something new), the algorithm will not even try to decrypt the string: it will know the string has been corrupted.

- Since `encryptio` uses a random Initilization Vector for each encryption, several encryption of the same string will always output a completely new encrypted string. This means that an attacker cannot compare two encrypted strings in the hope to find patterns.


Really, unless you pick a dumb easy secret-key and/or blindly distribute it to the world... you should be able to sleep peacefully. It would require a considerable amount of efforts and money to break this encryption.


##### DONTs

Let's face it, if you plan to use this lib to encrypt political, highly pricey secrets, or the name of who killed JFK... that may not be a good idea.

Like exposed in the `DOs` section above, this is not a bulletproof solution. The main reason being... YOU. You are more likely to fail keeping the secret key than someone breaking the `AES` encryption. For example, if you choose a weak predictable secret key... brute force can quickly take your secret down.

One common mistake might also be to trust other 3rd parties like team mates, co-workers, or applications that might just also neglect your secret until... some attacker gets it.

Finally, if you store a secret key that gives a $200 billion price... someone might actually put $100 billion to the table to buy sufficient computing power to crack your secret. Who knows?

##### Summary

**!! USE A REALLY RANDOM SECRET KEY !!**

**!! NEVER SHARE IT !!**

...and you should be safe ;)