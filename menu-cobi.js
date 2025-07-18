let alimentos = {};
const caloriasObjetivo = parseInt(localStorage.getItem("calorias_diarias")) || 2000;
const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
let menuGlobal = [];

const restricciones = {
  sin_lactosa: ["lacteos"],
  sin_gluten: [], // Puedes personalizarlo si tienes alimentos con gluten
  vegetariano: ["pollo", "pescado"],
  vegano: ["pollo", "pescado", "huevo", "leche", "queso", "yogur", "kefir"]
};

function getSeleccionados(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(e => e.value);
}

function filtrarAlimentos(gustos, restrics) {
  const bloqueados = new Set();
  restrics.forEach(r => {
    if (restricciones[r]) {
      restricciones[r].forEach(b => bloqueados.add(b));
    }
  });

  const filtrados = {};
  gustos.forEach(cat => {
    if (!bloqueados.has(cat) && alimentos[cat]) {
      filtrados[cat] = alimentos[cat].filter(a => {
        return ![...bloqueados].some(word => a.nombre.toLowerCase().includes(word));
      });
    }
  });

  return filtrados;
}

function generarComida(filtrados) {
  const comidas = [];
  Object.values(filtrados).forEach(lista => {
    if (lista.length > 0) {
      const item = lista[Math.floor(Math.random() * lista.length)];
      comidas.push(item);
    }
  });
  return comidas;
}

function comidaAHTML(lista) {
  return lista.map(a => `${a.nombre} (${a.porcion}, ${a.calorias} kcal)`).join("<br>");
}

function comidaATexto(lista) {
  return lista.map(a => `${a.nombre} (${a.porcion}, ${a.calorias} kcal)`).join(", ");
}

function generarDiaMenu(gustos, restrics) {
  const filtrados = filtrarAlimentos(gustos, restrics);
  return {
    desayuno: generarComida(filtrados),
    almuerzo: generarComida(filtrados),
    cena: generarComida(filtrados),
    snack: generarComida(filtrados)
  };
}

function mostrarMenu(menu, gustos, restrics) {
  let html = `<table><thead>
    <tr><th>Día</th><th>Desayuno</th><th>Almuerzo</th><th>Cena</th><th>Snack</th><th></th></tr>
  </thead><tbody>`;

  dias.forEach((dia, i) => {
    const d = menu[i];
    html += `<tr>
      <td>${dia}</td>
      <td>${comidaAHTML(d.desayuno)}</td>
      <td>${comidaAHTML(d.almuerzo)}</td>
      <td>${comidaAHTML(d.cena)}</td>
      <td>${comidaAHTML(d.snack)}</td>
      <td><button class="regenerar-btn" onclick="regenerarDia(${i})">🔄</button></td>
    </tr>`;
  });

  html += "</tbody></table>";
  document.getElementById("resultadoMenu").innerHTML = html;
}

function regenerarDia(index) {
  const gustos = getSeleccionados("gustos");
  const restrics = getSeleccionados("restricciones");
  menuGlobal[index] = generarDiaMenu(gustos, restrics);
  mostrarMenu(menuGlobal, gustos, restrics);
  guardarEnLocal();
}

function guardarEnLocal() {
  localStorage.setItem("menuCOBI", JSON.stringify(menuGlobal));
}

function cargarDesdeLocal() {
  const datos = localStorage.getItem("menuCOBI");
  if (datos) {
    menuGlobal = JSON.parse(datos);
    const gustos = getSeleccionados("gustos");
    const restrics = getSeleccionados("restricciones");
    mostrarMenu(menuGlobal, gustos, restrics);
  }
}

function inicializarMenu() {
  document.getElementById("formMenu").addEventListener("submit", function (e) {
    e.preventDefault();
    const gustos = getSeleccionados("gustos");
    const restrics = getSeleccionados("restricciones");

    if (gustos.length === 0) {
      alert("Selecciona al menos un gusto.");
      return;
    }

    menuGlobal = [];
    for (let i = 0; i < 7; i++) {
      menuGlobal.push(generarDiaMenu(gustos, restrics));
    }

    mostrarMenu(menuGlobal, gustos, restrics);
    guardarEnLocal();
  });

  // Botón copiar
  document.getElementById("copiarBtn").addEventListener("click", () => {
    if (!menuGlobal.length) return alert("Primero genera el menú.");
    let texto = "🍽️ Menú Semanal - COBI\n\n";
    dias.forEach((dia, i) => {
      const d = menuGlobal[i];
      texto += `📅 ${dia}\n`;
      texto += `  Desayuno: ${comidaATexto(d.desayuno)}\n`;
      texto += `  Almuerzo: ${comidaATexto(d.almuerzo)}\n`;
      texto += `  Cena: ${comidaATexto(d.cena)}\n`;
      texto += `  Snack: ${comidaATexto(d.snack)}\n\n`;
    });
    navigator.clipboard.writeText(texto).then(() => {
      alert("Menú copiado al portapapeles.");
    });
  });

  // Imprimir
  document.getElementById("descargarBtn").addEventListener("click", () => {
    if (!menuGlobal.length) return alert("Primero genera el menú.");
    const contenido = document.getElementById("resultadoMenu").innerHTML;
    const ventana = window.open("", "", "width=800,height=700");
    ventana.document.write("<html><head><title>Menú COBI</title>");
    ventana.document.write("<style>body{font-family:sans-serif;padding:2rem;}table{width:100%;border-collapse:collapse;}td,th{border:1px solid #ddd;padding:8px;}th{background:#f0f0f0;}</style>");
    ventana.document.write("</head><body><h2>Menú Semanal - COBI</h2>");
    ventana.document.write(contenido);
    ventana.document.write("</body></html>");
    ventana.document.close();
    ventana.print();
  });

  // Email
  document.getElementById("enviarBtn").addEventListener("click", () => {
    if (!menuGlobal.length) return alert("Primero genera el menú.");
    const email = document.getElementById("correo").value.trim();
    if (!email) return alert("Ingresa un correo válido.");

    const texto = dias.map((dia, i) => {
      const d = menuGlobal[i];
      return `📅 ${dia}\nDesayuno: ${comidaATexto(d.desayuno)}\nAlmuerzo: ${comidaATexto(d.almuerzo)}\nCena: ${comidaATexto(d.cena)}\nSnack: ${comidaATexto(d.snack)}\n`;
    }).join("\n");

    emailjs.send("COBI_service", "template_1t528vh", {
      to_email: email,
      mensaje_menu: texto
    }, "user_7LNZ17eIMJzHrwA86")
    .then(() => alert("Correo enviado exitosamente."))
    .catch(() => alert("Error al enviar el correo."));
  });
}

// Cargar alimentos y luego inicializar
fetch("alimentos.json")
  .then(res => res.json())
  .then(data => {
    alimentos = data;
    inicializarMenu();
    cargarDesdeLocal();
  })
  .catch(err => {
    console.error("Error cargando alimentos.json:", err);
    alert("No se pudo cargar el menú. Intenta nuevamente.");
  });
