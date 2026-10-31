const DB = "https://revzz-license-key-default-rtdb.firebaseio.com/keys";

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  const {key} = req.query;
  if(!key) return res.json({status:"invalid"});
  try{
    const r = await fetch(DB+".json");
    const data = await r.json();
    if(!data) return res.json({status:"invalid"});
    let found = data[key] || Object.values(data).find(k=>k && k.key===key);
    if(found) return res.json({status:"valid", key:found.key});
    return res.json({status:"invalid"});
  }catch(e){
    return res.json({status:"error"});
  }
}