const express = require("express");
const fs = require("fs");
const router = express.Router();

const FILE = "./data/users.csv";
if (!fs.existsSync(FILE))
  fs.writeFileSync(FILE, "id,name,email,password,role,reference\n");

const read = () =>
  fs.readFileSync(FILE, "utf8").trim().split("\n").slice(1)
    .map(l => {
      const [id,name,email,password,role,reference] = l.split(",");
      return { id, name, email, password, role, reference };
    });

const write = d =>
  fs.writeFileSync(FILE,
    "id,name,email,password,role,reference\n" +
    d.map(u =>
      `${u.id},${u.name},${u.email},${u.password},${u.role},${u.reference}`
    ).join("\n")
  );

const genRef = r =>
  (r === "doctor" ? "DOC-" : "PAT-") +
  Math.floor(1000 + Math.random() * 9000);

router.post("/signup", (req,res)=>{
  const { name,email,password,role } = req.body;
  const all = read();

  if (all.find(u => u.email === email))
    return res.status(400).json({ error:"Email already exists" });

  let ref;
  do { ref = genRef(role); }
  while (all.find(u => u.reference === ref));

  const user = {
    id: Date.now().toString(),
    name, email, password, role, reference: ref
  };
  all.push(user);
  write(all);
  res.json(user);
});

router.post("/login", (req,res)=>{
  const { email,password } = req.body;
  const u = read().find(
    x => x.email === email && x.password === password
  );
  if (!u) return res.status(401).json({ error:"Invalid credentials" });
  res.json(u);
});

module.exports = router;
