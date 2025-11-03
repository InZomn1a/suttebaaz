import { JSONBIN } from '../config'

const BASE = 'https://api.jsonbin.io/v3/b/'

async function readBin(){
  const res = await fetch(BASE + JSONBIN.BIN_ID, {
    headers: {
      'X-Master-Key': JSONBIN.API_KEY
    }
  });
  if(!res.ok) throw new Error('Read failed ' + res.status);
  const body = await res.json();
  return body.record || {};
}

async function writeBin(data){
  const res = await fetch(BASE + JSONBIN.BIN_ID, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN.API_KEY
    },
    body: JSON.stringify(data)
  });
  if(!res.ok) throw new Error('Write failed ' + res.status);
  const body = await res.json();
  return body;
}

export { readBin, writeBin };
