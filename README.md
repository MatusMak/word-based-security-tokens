# Word-based security tokens generator

Example NodeJS implementation of word-based security tokens generator, inspired by [Notion](https://www.notion.so/).


## Motivation

Short lived security tokens are essential part of two-factor authentication (2FA) and verification processes (registration, recovering password, ...). Usually, they consist either of several digits or several letters and digits, but may be longer. The issue is that they don't bear any meaning, which makes them prone to be typed in incorrectly. Examples of some of the services and their respective key lengths & types include:

| Service        | Length & Type  |
|----------------|----------------|
| Visa 3D Secure | 6 alphanumeric |
| Steam Guard    | 5 alphanumeric |
| OpenVPN Server | 6 numbers      |

[Notion](https://www.notion.so/) is a wiki-like service (think of it as of Confluence, but actually good) that allows students to use premium accounts using their university e-mails. With this method, you will never set up your password, but with each log-in attempt, you will be e-mailed a one time pass phrase consisting of 4 English words, which you are supposed to be used as a one time password (or rather pass phrase).

This project is an example implementation of this idea in NodeJS to demonstrate how such system can function in practice.


## Implementation & Usage

As this is a NodeJS project, you will need to install dependencies. This project is using only a handful of support packages, totaling to about 90 kB. Installation can be done using this command:

```console
npm install
```

In the following sections, a language parameter will be mentioned. In the current state of this proof-of-concept, only `english` is supported (case sensitive).

### Generation of dictionary

As expected, for this system to work, you need to have a dictionary that will be your pool of words for token generation. Raw dictionaries, unfortunately, contain a lot of words that are unsuitable - either too short, too long, look unnatural, are inappropriate, etc. Therefore, we need to process these raw words and filter them to create smaller internal dictionary that will be safe to use for token generation.

A more detailed description of this process can be found in [dictionary-generator.js module](dictionary-generator.js). Processed dictionaries are json arrays located in [dictionaries folder](dictionaries), while raw counterparts are newline separated files located in [dictionaries/raw folder](dictionaries/raw).

Generation can be triggered by the following command:

```console
npm run dictionary [language]
```

_Note: we are generating dictionary as a shortcut, but given enough time & resources, you should create your dictionary by hand, which would have unparalleled quality to anything automatically generated._

### Generation & verification of token

This part of the application is triggered by the following command:

```console
npm run token [language]
```

It first performs generation of the token and then allows you to verify it.

### Generation

Assuming a dictionary for a given language exists, it loads it and then picks specified number of random words using cryptographically secure pseudo-random number generator (_CSPRNG_) from `crypto` module. These words are then put together to create a pass phrase that is then essentially treated as a password - a unique salt is generated (again using CSPRNG) and together with pass phrase a hash - secret is computed using scrypt algorithm, which is stored as base64 string.

### Verification

For demonstration purposes, generated pass phrase along with its salt and secret are stored in local file `pass phrase_dump.txt`, so that they can be easily viewed. However, in real-life application, you would send pass phrase to user via trusted channel (e.g. e-mail or SMS) and salt & secret would be stored in your database just like you would store regular passwords.

At this point, application will wait for your input. You have 5 attempts to enter correct pass phrase. Your input is hashed in the same way as the original generated one and if hashes match, we know the input is correct.


## Security

Naturally, we have to analyze how secure this method is compared to security tokens. We assume that usage of cryptographically secure random number generator and hash function is granted. For calculating crack times approximations, I used [How secure is my password](https://howsecureismypassword.net/).

### Standard tokens security

With 5 or 6 characters long, security tokens are surprisingly weak. With 36^6 possible combinations ([10 digits + 26 capital letters of English] ^ 6 characters), it would take about 54 milliseconds to crack! That's why their lifetime has to be very short and why users have only few tries to type them in. If you are using Time-based One-time passwords algorithms (TOTP), this isn't that big of a concern for you as each code lives only up to 1 minute, but if you are generating and storing tokens in database, this can be an issue - you will have to do all the hard work manually.

### Word-based tokens security

With 52 thousand unfiltered words with average length of 5 letters, 4 words pass phrase has 52000^4 word combinations. Even if dictionary would be reduced to just 10 thousand words, pass phrase would still have 6 orders of magnitude more combinations than standard token. With average length of 24 characters, it would take 83 quintillion years to crack it. 


## Pros

- More secure than tokens
- Easy to implement if you have preexisting dictionary database
- Easier for users to type in
- Suitable even for long lived tokens
- You might feel cool for not using "boring" methods


## Cons

- Managing multiple languages can be difficult
- Larger memory footprint (if you want to cover many languages)
- You might need to add filters to prevent from generating inappropriate or insulting sentences
- AFAIK there's no library for this => you need to create your own => you may potentially write vulnerable code

_Note: pros & cons are in no particular order_


## Contribution

This is a proof-of-concept and not library, so while contributions are welcomed, it only makes sense doing them for educational purposes or for community events such as Hacktoberfest. If you are still interested, check **Issues** for available "assignments".
