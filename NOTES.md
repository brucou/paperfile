# Resources
## Spelling API
[spelling API](https://languagetool.org/http-api/#!/default/post_check):
  - can dry test spelling API
  - POST: check with `wrng` returns
```json
{
  "software": {
    "name": "LanguageTool",
    "version": "5.4-SNAPSHOT",
    "buildDate": "2021-06-02 14:22:33 +0000",
    "apiVersion": 1,
    "premium": true,
    "premiumHint": "You might be missing errors only the Premium version can find. Contact us at support<at>languagetoolplus.com.",
    "status": ""
  },
  "warnings": {
    "incompleteResults": false
  },
  "language": {
    "name": "English (US)",
    "code": "en-US",
    "detectedLanguage": {
      "name": "Polish",
      "code": "pl-PL",
      "confidence": 0.132
    }
  },
  "matches": [
    {
      "message": "Possible spelling mistake found.",
      "shortMessage": "Spelling mistake",
      "replacements": [
        {
          "value": "wrong"
        },
        {
          "value": "Wang"
        },
        {
          "value": "wing"
        },
        {
          "value": "Wong"
        },
        {
          "value": "RNG"
        },
        {
          "value": "wrung"
        },
        {
          "value": "wring"
        }
      ],
      "offset": 0,
      "length": 4,
      "context": {
        "text": "wrng",
        "offset": 0,
        "length": 4
      },
      "sentence": "wrng",
      "type": {
        "typeName": "Other"
      },
      "rule": {
        "id": "MORFOLOGIK_RULE_EN_US",
        "description": "Possible spelling mistake",
        "issueType": "misspelling",
        "category": {
          "id": "TYPOS",
          "name": "Possible Typo"
        },
        "isPremium": false
      },
      "ignoreForIncompleteSentence": false,
      "contextForSureMatch": 0
    }
  ]
}
```
  - request: 
```shell
## https://api.languagetoolplus.com/v2/check?text=wrng&language=en-US&enabledOnly=false
curl -X POST --header 'Content-Type: application/x-www-form-urlencoded' --header 'Accept: application/json' -d 'text=wrng&language=en-US&enabledOnly=false' 'https://api.languagetoolplus.com/v2/check'
```

NOTE: **running the previous command failed on Windows!**

  - response schema:
```json
{
  "software": {
    "name": "string",
    "version": "string",
    "buildDate": "string",
    "apiVersion": 0,
    "status": "string",
    "premium": true
  },
  "language": {
    "name": "string",
    "code": "string",
    "detectedLanguage": {
      "name": "string",
      "code": "string"
    }
  },
  "matches": [
    {
      "message": "string",
      "shortMessage": "string",
      "offset": 0,
      "length": 0,
      "replacements": [
        {
          "value": "string"
        }
      ],
      "context": {
        "text": "string",
        "offset": 0,
        "length": 0
      },
      "sentence": "string",
      "rule": {
        "id": "string",
        "subId": "string",
        "description": "string",
        "urls": [
          {
            "value": "string"
          }
        ],
        "issueType": "string",
        "category": {
          "id": "string",
          "name": "string"
        }
      }
    }
  ]
}
```

# Implementation
## Interesting links
- XML parser playground: https://jsonformatter.org/xml-parser#Sample
- XML libraries
  - https://github.com/SAP/xml-tools/tree/master/packages/ast
  - https://github.com/NaturalIntelligence/fast-xml-parser
  - playground: https://naturalintelligence.github.io/fast-xml-parser/
  - https://github.com/rgrove/parse-xml
- docx libraries   
  - https://github.com/lalalic/docx4js
  - mamooth
  - open office convert
  - some others, but we discarded all of them:
    - unmaintained, no tests, scarce docs, and one did not work with the buffer provided in the request (maybe required an array buffer?)
  
