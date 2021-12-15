# Tibbistoro Test API

Simply run `npm i` and then `node index.js` to get started!


## Requests
## Format
### From the Tibbo
Requests from the Tibbo are expected in this format:

```
your-data-unitXXX
```

*Note:* `unitXXX` meaning the unit ID will always be the last hyphen-separated item.

## Authentication
The files `key.txt` and `value.txt` must be created and their contents must match what is 
bundled in the firmware of the Tibbo.

### Sample `key.txt`
```text
SampleKey
```

### Sample `value.txt`
```text
Tibbistoro
```

## Endpoints
### Identify
#### From the Tibbo

Used to associate a Tibbo's IP Address with a Unit ID on the backend


**Endpoint**
> `POST /ident`



**Required Data** 
* IP Address
* Unit ID


**Example Data**
> `0.0.0.0-unit10`

---


### Authenticate
#### From the Tibbo

Used to test passed card data against the backend database


**Endpoint**
> `POST /auth`


**Required Data**
* Card Code
* Facility Code
* Unit ID


**Response**
* noYes - Authenticated


**Example Data**
> `12123-1231-unit10`
