const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const file = path.join(__dirname,"../data/doctorPatient.csv");

function read(){
  if(!fs.existsSync(file)) return [];
  const [h,...l]=fs.readFileSync(file,"utf8").trim().split("\n");
  const k=h.split(",");
  return l.map(r=>{
    const o={};
    r.split(",").forEach((v,i)=>o[k[i]]=v);
    return o;
  });
}
function write(d){
  const h=Object.keys(d[0]).join(",");
  const r=d.map(x=>Object.values(x).join(","));
  fs.writeFileSync(file,[h,...r].join("\n"));
}

/* LINK */
router.post("/link",(req,res)=>{
  const { doctorRef, patientRef } = req.body;
  const all = read();

  if(all.find(x=>x.doctorRef===doctorRef && x.patientRef===patientRef))
    return res.json({success:true});

  all.push({ doctorRef, patientRef });
  write(all);
  res.json({success:true});
});

/* GET PATIENTS */
router.get("/patients/:doctorRef",(req,res)=>{
  res.json(read().filter(x=>x.doctorRef===req.params.doctorRef));
});

module.exports = router;
