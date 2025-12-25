export function snowEffect(count = 50){
  const snow = document.getElementById("snow");
  snow.innerHTML = "";
  for(let i=0;i<count;i++){
    const flake = document.createElement("div");
    flake.className = "flake";
    flake.style.left = (Math.random()*100) + "vw";
    flake.style.animationDuration = (3 + Math.random()*5) + "s";
    flake.style.opacity = (0.35 + Math.random()*0.65);
    flake.style.width = flake.style.height = (6 + Math.random()*8) + "px";
    snow.appendChild(flake);
  }
}

export function burstEffect(amount = 20){
  for(let i=0;i<amount;i++){
    const b = document.createElement("div");
    b.className = "burst";
    b.style.left = (10 + Math.random()*80) + "vw";
    b.style.top  = (20 + Math.random()*40) + "vh";
    document.body.appendChild(b);
    setTimeout(()=>b.remove(), 800);
  }
}
